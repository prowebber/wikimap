/**
	Change the page ID from apple 18978754 to the page id of any
	other page to view results for that page.
	
	--------------------------------------------------------------------------------
	| Page ID       | Query Time    | Nickname      | Notes                         |
	|-------------------------------------------------------------------------------|
	| 18978754      | 1m 55s 641ms  | Apple         | Server under load              |
	 
	 */
EXPLAIN SELECT
	pc.T0 AS T0_page_id,
	CAST(p2.page_title AS CHAR) AS T0_page_title,
	pc.T1 AS T1_page_id,
	CAST(p.page_title AS CHAR) AS T1_page_title,
    (   -- Get the total links for T0
	    SELECT
		    COUNT(*) AS T0_total_links
	    FROM wikimap.page_connections pc4
	    WHERE
		    pc4.T0 = pc.T0
    ) AS T0_total_links,
	(   -- Get the total links for T1
	    SELECT
		    COUNT(*) AS T1_total_links
	    FROM wikimap.page_connections pc5
	    WHERE
		    pc5.T0 = pc.T1
    ) AS T0_total_links,
	COUNT(pc2.T1) AS T0_T1_shared_connections       # Count the total shared connections
FROM wikimap.page_connections pc
	-- Find all of the connections between T0 and T1
	LEFT JOIN wikimap.page_connections pc2
		ON pc2.T0 = pc.T1                           # Find all the page_ids connected to the page_ids that T0 is connected to
	
	-- Get the page_titles for T0 and T1
	LEFT JOIN wikimap.pages p
		ON p.page_id = pc.T1
	LEFT JOIN wikimap.pages p2
		ON p2.page_id = pc.T0
WHERE
	pc.T0 = '18978754'
	
	-- Only show results for shared connections between T0 and T1
	AND pc2.T1 IN (
		-- Create a list of the page_ids T0 is connected to
		SELECT
			pc3.T1
		FROM wikimap.page_connections pc3
		WHERE
			pc3.T0 IN (18978754)
	)
GROUP BY pc.T1
ORDER BY T0_T1_shared_connections DESC
;