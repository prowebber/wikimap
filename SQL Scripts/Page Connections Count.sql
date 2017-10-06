/**
	Do the following:
	
	1) Search the database for pages which have the highest total connections
	2) Display the top 500 results
 */
EXPLAIN SELECT
	p.page_id,
	p.page_title,
	p.total_connections
FROM wikimap.pages p
ORDER BY p.total_connections DESC
LIMIT 500;