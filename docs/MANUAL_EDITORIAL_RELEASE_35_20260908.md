# TrendingNow manual editorial release receipt — 35 collections

Date: 2026-09-08

Admission mode: `owner_authorized_manual`

Approval: `owner` at `2026-09-08T13:41:13.683Z`

Decision: publish the selected 35 frozen collections through the static public loader.

This is an explicit owner decision, not an automatic `READY`/`accepted` result. The source article files were not edited and remain `DRAFTED_HOLD`. The public UI receives the editorial content, exact products, source links, dated observation and disclosure; manual approval metadata and pending-gate administration are not rendered as reader-facing copy.

## Boundaries and counts

| Item | Value |
|---|---:|
| Preserved source rows | 50 |
| Selected standalone collections | 35 |
| Supporting rows retained outside this bundle | 15 |
| Collections written to the public static bundle | 35 |
| Automatic gate status | `HOLD` |
| Source draft bodies changed by this release | 0 |
| Push/deploy/live publication performed here | 0 |

The bundle is `src/features/blog/data/accepted-collections.json`. Each record has an exact content hash, a per-record owner receipt hash, the source article byte hash, the selection-row hash, exact `productIDs`, the complete frozen `sourceURLs` list, `sourceDate: 2026-09-07`, and the editorial disclosure. The loader still rejects duplicate product IDs, missing exact source URLs, changed content, unapproved manual records and invalid bundle receipts.

## Hash-bound receipt

| Evidence | SHA-256 |
|---|---|
| Selection `agents/seo-autocontent/content/trendingnow-release-50-20260908/checks/release-selection-20260908.json` | `875563d0b1afeb3bbd3140185c15f6c0ce5258e227f8a92431bf33e7740dce8b` |
| Source register `agents/seo-autocontent/content/trendingnow-release-50-20260908/sources/source-register-20260907.json` | `c53478040843c661db57afe7b267a5b2667d0bf90e67bb9834d9c70c65ccea09` |
| Automatic gate receipt `agents/seo-autocontent/content/trendingnow-release-50-20260908/checks/gate-status.json` | `ec70665269bdbb5d9dd757c7b9917b14d5bbae9589287564cccc4c4e7b5ed2b7` |
| 35-record bundle hash | `1d36b7c71fb6f847c257ce6261ecfe049d0fe09301a9b1f3afb3c8f9c2a47015` |
| Manual release receipt hash | `14aca10bdba4d908574dd5d752e9502a1bdd246cf994a4b5d70ae1ca1af8ccd1` |

The top-level `manualReceipt` in the JSON binds the selected slug order, preserved/supporting counts, evidence hashes, pending-gate statuses and bundle hash. The loader recomputes these values before returning any manual records.

## Automatic gates still pending

These facts remain recorded and were not waived or relabeled as passes:

| Gate | Current status |
|---|---|
| Mechanical Georgian lint | `FLAGS_REMAIN` |
| Content safety | `PENDING_NOT_RUN` |
| Product knowledge | `PENDING_NOT_RUN` |
| Native Georgian review | `PENDING` |
| Image rights | `UNKNOWN` |
| Market demand | `UNKNOWN` |
| AI-search observation | `OBSERVED_ONLY_PRIORITY5` (`NOT_GRANTED`) |
| Root acceptance | `PENDING` |
| Production mapping | `NOT_GRANTED` |
| Publication gate | `NOT_ATTEMPTED` |

Image/rights evidence, independent native-Georgian review, demand evidence, production mapping, live delivery and merchant outcomes are not claimed by this receipt. Prices and availability remain dated/source observations and must be checked with the seller.

## Selected collection slugs

```text
buyer-decision-log-20260907
comparison-table-20260907
family-tech-budget-20260907
gift-scenarios-20260907
home-broadlink-neutral-wire
home-cleaning-routine-choice
home-espresso-workflow
home-eufy-homebase-check
home-eufy-outdoor-placement
home-kettle-capacity
home-mixer-attachments
home-morning-kitchen-pair
home-mova-pack-choice
home-mova-thermal-control
home-robot-app-wifi
home-robot-mop-surfaces
home-robot-vacuum-low-furniture
home-smart-camera-switch-choice
outbound-path-20260907
seasonal-home-20260907
shopping-truth-20260907
source-reading-20260907
workspace-cable-map
workspace-desk-audio-ports
workspace-desk-power-route
workspace-laptop-charger-verification
workspace-laptop-hp-lenovo
workspace-laptop-lenovo-dell
workspace-laptop-ports-three
workspace-laptop-travel-power
workspace-mic-phone-setup
workspace-mouse-ergonomic
workspace-mouse-gaming-work
workspace-power-strip-six-outlets
workspace-powerbank-laptop-check
```

## Reproduction

From the client directory, the deterministic builder is:

```text
node scripts/build-manual-accepted-collections.mjs --approved-at 2026-09-08T13:41:13.683Z --approved-by owner
```

Changing any source article byte, selection row, evidence receipt, exact product mapping, approval timestamp or owner name changes the receipt and fails the corresponding integrity check. This work did not push, deploy or assert live indexing, ranking, traffic, delivery or sales.
