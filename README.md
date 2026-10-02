# loaded-baked-potato

# Jira
https://mollyd13.atlassian.net?continue=https%3A%2F%2Fmollyd13.atlassian.net%2Fwelcome%2Fsoftware&atlOrigin=eyJpIjoiMmNlMDM4ZTdjMzk4NDQ0MjhlOWQ0YTc2YzBhNTFlZWUiLCJwIjoiaiJ9

# Figma
https://www.figma.com/design/ouMatGQ5NYsZor1kRKorpX/Webpage-mockups?t=eqMrtVfA7E50S1tU-0

# Duplicate message handling
**Duplicate message handling:** `OrderExecutionService.executeOrder` locks the order and skips anything not `PENDING`, so a repeated message executes once. Demonstrated in `app/src/test/java/com/matador/app/service/DuplicateMessageTest.java` (run: `cd app && ./mvnw test -Dtest=DuplicateMessageTest`).

# Risk list

| # | Risk | Likelihood | Impact | Mitigation | Status |
|---|---|---|---|---|---|
| R1 | Same message delivered twice fills an order twice (double trade, double charge) | Med | High | `executeOrder` locks the order row and only executes `PENDING` orders; proven by `DuplicateMessageTest` | Mitigated |
| R2 | Cash or holdings change between order validation and execution | Med | High | Execution re-checks funds/holdings and rejects instead of part-filling; DB `CHECK (balance >= 0)` on cash | Mitigated |
| R3 | Messaging (publish order-accepted, consume to execute) not built yet, so accepted orders stay `PENDING` | High | High | Event flow designed; execution already safe for duplicates; producer/consumer in backlog | Open |
| R4 | Orders execute while the market is closed | High | Med | Re-enable the market-hours check at execution time | Open |
| R5 | Rejected orders don't record why | High | Low | Add a rejection-reason column | Open |
| R6 | Backend has no tests or security scan in CI (Jenkins only covers the Angular app) | High | Med | Add `mvnw verify` and OWASP dependency-check stages to Jenkins | Open |
| R7 | Full-app test needs a live Postgres, so it can't run in CI | High | Med | Testcontainers or a Postgres service in the pipeline | Open |
