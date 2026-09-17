# Vega Experiment 001 — Daily Action Report

**WS-016-first-value-experiment**

Digital concierge experiment for the hypothesis that a small business operator can turn an existing operational export into a prioritized daily action list and save enough time/value to repeat the workflow.

## Run

Open `index.html` directly in a browser or serve this directory with any static web server.

1. Try **Usar amostra** to understand the flow.
2. For a real test, choose the operator's CSV locally.
3. Review the prioritized actions.
4. Ask the participant to report time saved, the most useful action, repeat intent, and willingness to pay.
5. Export the observation JSON and attribute/review it before treating it as evidence.

## Data boundary

The MVP is intentionally client-side. CSV contents are parsed in the browser and are not sent to Vega or another backend. The exported observation contains only experiment feedback fields, not the source CSV.

The bundled sample is synthetic and **must not be counted as market evidence**.

## Experiment boundary

- No account or authentication.
- No payment collection.
- No production integration.
- No automated claim of product-market fit.
- Reversible static experiment.

See the parent Vega repository for the experiment definition, evaluation criteria, provenance and governance artifacts.
