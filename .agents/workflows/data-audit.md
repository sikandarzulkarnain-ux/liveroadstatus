# DATA INTEGRITY AUDIT


Audit all LiveRoadStatus live-data systems.


Check:


1. Official data sources
2. API reliability
3. Source timestamps
4. Data freshness
5. OPEN/CAUTION/CLOSED logic
6. UNKNOWN handling
7. API failures
8. Missing information
9. Conflicting sources
10. Source URLs
11. Status history
12. Frontend stale-data handling


Never change data simply to make the system look complete.


If official information cannot be verified:


Use UNKNOWN.


If sources conflict:


Flag the conflict.


Never fabricate:


- road status
- closures
- weather
- restrictions
- snow
- avalanche risk
- reopening times


Return issues as:


CRITICAL
HIGH
MEDIUM
LOW
