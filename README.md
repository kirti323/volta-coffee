## 🏗️ System Architecture

```mermaid
flowchart LR
    A[Customer Ordering App] --> B[POS System]
    B --> C[Data Layer]
    C --> D[Analytics Dashboard]

    C --> E[(Orders Database)]
    C --> F[(Customer Data)]
    C --> G[(Product Data)]

    D --> H[Revenue Metrics]
    D --> I[Order Volume]
    D --> J[Customer Insights]

These metrics simulate real-world business intelligence dashboards used in retail operations.
