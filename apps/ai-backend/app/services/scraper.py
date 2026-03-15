"""
Playwright Party Intelligence Scraper
Researches the counterparty from public web sources.
"""

import asyncio
from playwright.async_api import async_playwright
from langchain_openai import ChatOpenAI
from langchain.prompts import ChatPromptTemplate
from pydantic import BaseModel
from app.config import settings


class ScrapedSource(BaseModel):
    url: str
    title: str
    snippet: str


class PartyIntelligenceResult(BaseModel):
    counterparty_name: str
    trust_score: int
    reputation_summary: str
    red_flags: list[str]
    sources: list[ScrapedSource]


SEARCH_QUERIES = [
    "{name} lawsuit",
    "{name} fraud complaints",
    "{name} reviews reputation",
    "{name} BBB complaints",
    "{name} glassdoor",
]


async def _scrape_search_results(query: str) -> list[ScrapedSource]:
    """Use Playwright to search DuckDuckGo and extract results."""
    sources: list[ScrapedSource] = []
    try:
        async with async_playwright() as p:
            browser = await p.chromium.launch(headless=True)
            page = await browser.new_page()
            search_url = f"https://duckduckgo.com/?q={query.replace(' ', '+')}&ia=web"
            await page.goto(search_url, timeout=15000)
            await page.wait_for_selector("article[data-testid='result']", timeout=8000)

            results = await page.query_selector_all("article[data-testid='result']")
            for result in results[:4]:
                title_el = await result.query_selector("h2")
                url_el = await result.query_selector("a")
                snippet_el = await result.query_selector("[data-result='snippet']")

                title = await title_el.inner_text() if title_el else ""
                url = await url_el.get_attribute("href") if url_el else ""
                snippet = await snippet_el.inner_text() if snippet_el else ""

                if title and url:
                    sources.append(ScrapedSource(url=url, title=title, snippet=snippet[:300]))

            await browser.close()
    except Exception as e:
        print(f"[scraper] Playwright error for query '{query}': {e}")
    return sources


async def run_party_intelligence(counterparty_name: str) -> PartyIntelligenceResult:
    """
    Scrape multiple search queries for the counterparty and synthesise
    a trust score and reputation summary using LLM.
    """
    # Run scraping queries concurrently
    queries = [q.format(name=counterparty_name) for q in SEARCH_QUERIES]
    results = await asyncio.gather(*[_scrape_search_results(q) for q in queries])

    all_sources: list[ScrapedSource] = []
    seen_urls: set[str] = set()
    for batch in results:
        for source in batch:
            if source.url not in seen_urls:
                all_sources.append(source)
                seen_urls.add(source.url)

    # LLM synthesis
    sources_text = "\n".join(
        f"Source {i+1}: {s.title}\nURL: {s.url}\nSnippet: {s.snippet}"
        for i, s in enumerate(all_sources[:10])
    )

    class SynthesisOutput(BaseModel):
        trust_score: int
        reputation_summary: str
        red_flags: list[str]

    from langchain.output_parsers import PydanticOutputParser
    parser = PydanticOutputParser(pydantic_object=SynthesisOutput)

    prompt = ChatPromptTemplate.from_messages([
        (
            "system",
            "You are a business intelligence analyst. Based on the web search results about a company/person, "
            "provide: trust_score (0-100, where 100 is most trustworthy), reputation_summary (2-3 sentences), "
            "and red_flags (list of specific concerns found, or empty list if none).",
        ),
        (
            "human",
            "Research subject: {name}\n\nSearch results:\n{sources}\n\n{format_instructions}",
        ),
    ])

    llm = ChatOpenAI(
        model=settings.openai_model,
        temperature=0.1,
        api_key=settings.openai_api_key,
    )
    chain = prompt | llm | parser

    try:
        synthesis: SynthesisOutput = await chain.ainvoke({
            "name": counterparty_name,
            "sources": sources_text if sources_text else "No web results found.",
            "format_instructions": parser.get_format_instructions(),
        })
    except Exception as e:
        print(f"[scraper] LLM synthesis error: {e}")
        synthesis = SynthesisOutput(
            trust_score=50,
            reputation_summary=f"Unable to find substantial public information about {counterparty_name}. Exercise standard due diligence.",
            red_flags=[],
        )

    return PartyIntelligenceResult(
        counterparty_name=counterparty_name,
        trust_score=synthesis.trust_score,
        reputation_summary=synthesis.reputation_summary,
        red_flags=synthesis.red_flags,
        sources=all_sources[:8],
    )
