// Renders component specimens at 100% zoom so text can actually be judged.
import { chromium } from '@playwright/test'

export const SPECIMENS = {
  archetypes: `flowchart LR
%%mp: node a1 archetype=service
%%mp: node a2 archetype=database
%%mp: node a3 archetype=queue
%%mp: node a4 archetype=storage
%%mp: node a5 archetype=user
%%mp: node a6 archetype=external
%%mp: node a7 archetype=process
%%mp: node a8 archetype=decision
%%mp: node a9 archetype=note
%%mp: node a10 archetype=default
  a1[Service] --- a2[Database]
  a3[Queue] --- a4[Storage]
  a5[User] --- a6[External]
  a7[Process] --- a8[Decision?]
  a9[Note] --- a10[Default]`,
  shapes: `flowchart LR
  s1([Stadium]) --- s2((Circle))
  s3(((Double))) --- s4[[Subroutine]]
  s5[/Lean right/] --- s6[\\Lean left\\]
  s7[/Trapezoid\\] --- s8[\\Inv trap/]
  s9[(Cylinder)] --- s10{{Hexagon}}
  s11{Diamond} --- s12>Odd note]`,
  text: `flowchart TD
  t1[Hi] --> t2[A considerably longer node label than usual]
  t2 --> t3[Two lines<br/>of label text]
  t3 --> t4[iiiiiiiiiiiiiiiiiiii]
  t4 --> t5[WWWWWWWWWWWWWWWWWWWW]
  t5 --> t6[Mixed WWW iii 123 label]
  t6 --> t7{A long decision label?}
  t7 --> t8[(A long database name here)]
  t8 --> t9{{A long queue name goes here}}
  t9 --> t10>A long note label goes here]
  t10 --> t11([A long stadium label here])`,
  edges: `flowchart LR
  e1[Solid] -->|labelled| e2[Target]
  e3[Dotted] -.->|dotted edge| e4[Target]
  e5[Thick] ==>|thick edge| e6[Target]
  e7[Two lines] -->|first line<br/>second line| e8[Target]
  e9[Bidirectional] <--> e10[Target]`,
  uml: `classDiagram
  direction LR
  class Order {
    <<aggregate root>>
    +UUID id
    +Money total
    +OrderStatus status
    +place() void
    +cancel(reason String) void
  }
  class LineItem {
    +SKU sku
    +int quantity
  }
  class Payment {
    <<interface>>
    +charge(amount Money) Receipt
  }
  class Empty
  Order "1" *-- "1..*" LineItem : contains
  Order o-- Payment : paid by
  Payment <|.. CardPayment
  Order ..> Inventory : reserves`,
  crowsfeet: `erDiagram
  CUSTOMER ||--o{ ORDER : places
  ORDER ||--|{ LINE_ITEM : contains
  PRODUCT }o--o{ CATEGORY : "belongs to"
  ORDER ||--o| INVOICE : bills
  CUSTOMER {
    uuid id PK
    string email_address UK
    timestamp created_at
  }
  ORDER {
    uuid id PK
    money total_amount
  }`,
  states: `stateDiagram-v2
  direction LR
  [*] --> Idle
  Idle --> Running : start
  state fork_state <<fork>>
  Running --> fork_state
  state check <<choice>>
  fork_state --> check
  check --> Done : ok
  Done --> [*]
  note right of Idle : A note with some text`,
  c4: `C4Context
  Person(p, "Shopper", "Buys things online")
  System(s, "Storefront", "Next.js application")
  SystemDb(d, "Orders DB", "Postgres 16")
  SystemQueue(q, "Events", "Kafka")
  System_Ext(e, "Payment provider", "Stripe")
  Rel(p, s, "Uses", "HTTPS")
  Rel(s, d, "Reads and writes")
  Rel(s, q, "Publishes")
  Rel(s, e, "Charges")`,
  groups: `flowchart TB
  subgraph one [A Group With A Long Title]
    g1[Alpha]
    g2[Beta]
  end
  subgraph two [Short]
    subgraph three [Nested Group]
      g3[Gamma]
    end
  end
  g1 --> g3`,
}

const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1500, height: 950 }, deviceScaleFactor: 2 })
await page.goto('http://localhost:5173/?d=basic&theme=' + (process.argv[3] ?? 'clean-light'))
await page.waitForSelector('[data-mp-ready="true"]', { timeout: 30000 })
await page.getByRole('button', { name: 'Hide code' }).click()

for (const [name, source] of Object.entries(SPECIMENS)) {
  await page.evaluate((s) => window.__mp?.setSource?.(s), source)
  await page.waitForFunction(() => document.querySelector('[data-mp-ready="true"]') !== null)
  await page.waitForTimeout(400)
  await page.getByRole('button', { name: '100%', exact: true }).click()
  await page.waitForTimeout(200)
  await page.locator('.mp-viewport').screenshot({ path: `${process.argv[2]}/${name}.png` })
}
console.log('specimens:', Object.keys(SPECIMENS).join(' '))
await browser.close()
