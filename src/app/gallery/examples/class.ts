import type { Example } from './types'

export const classDiagram: Example[] = [
  { title: 'Order domain model', source: `classDiagram
  class Customer {
    +UUID id
    +String email
    +Address billingAddress
    +placeOrder(Cart) Order
  }
  class Order {
    +UUID id
    +OrderStatus status
    +Money total()
    +cancel(reason) void
  }
  class OrderLine {
    +UUID sku
    +int quantity
    +Money unitPrice
    +Money subtotal()
  }
  class Payment {
    +UUID id
    +Money amount
    +PaymentStatus status
    +capture() void
    +refund(Money) Refund
  }
  class Shipment {
    +UUID id
    +String carrier
    +String trackingNumber
    +markDelivered() void
  }
  class Address {
    +String line1
    +String city
    +String postcode
    +String country
  }
  Customer "1" --> "*" Order : places
  Order "1" *-- "1..*" OrderLine : contains
  Order "1" --> "0..1" Payment : paid by
  Order "1" --> "*" Shipment : fulfilled by
  Customer "1" *-- "1..*" Address : has` },

  { title: 'Payment gateway strategy', source: `classDiagram
  class PaymentGateway {
    <<interface>>
    +authorize(Money, Card) AuthResult
    +capture(String authId) void
    +refund(String chargeId, Money) void
  }
  class StripeGateway {
    -String apiKey
    +authorize(Money, Card) AuthResult
    +capture(String authId) void
    +refund(String chargeId, Money) void
  }
  class AdyenGateway {
    -String merchantAccount
    +authorize(Money, Card) AuthResult
    +capture(String authId) void
    +refund(String chargeId, Money) void
  }
  class SandboxGateway {
    +authorize(Money, Card) AuthResult
    +capture(String authId) void
    +refund(String chargeId, Money) void
  }
  class PaymentService {
    -PaymentGateway gateway
    -RetryPolicy retries
    +pay(Order) Receipt
  }
  class AuthResult {
    +boolean approved
    +String authId
    +String declineCode
  }
  PaymentGateway <|.. StripeGateway
  PaymentGateway <|.. AdyenGateway
  PaymentGateway <|.. SandboxGateway
  PaymentService --> PaymentGateway : uses
  PaymentGateway ..> AuthResult : returns` },

  { title: 'Repository and unit of work', source: `classDiagram
  class Repository~T~ {
    <<interface>>
    +findById(UUID) T
    +findAll(Specification~T~) List~T~
    +save(T) void
    +delete(T) void
  }
  class OrderRepository {
    -EntityManager em
    +findById(UUID) Order
    +findByCustomer(UUID) List~Order~
    +save(Order) void
  }
  class UnitOfWork {
    -Set~Object~ dirty
    +register(Object) void
    +commit() void
    +rollback() void
  }
  class Specification~T~ {
    <<interface>>
    +isSatisfiedBy(T) boolean
    +and(Specification~T~) Specification~T~
  }
  class UnpaidOrders {
    +isSatisfiedBy(Order) boolean
  }
  Repository~T~ <|.. OrderRepository
  OrderRepository --> UnitOfWork : enlists in
  Repository~T~ ..> Specification~T~ : queries with
  Specification~T~ <|.. UnpaidOrders` },

  { title: 'React component hierarchy', source: `classDiagram
  class App {
    +Router router
    +render() ReactNode
  }
  class DiagramPage {
    -String source
    -Theme theme
    +onSourceChange(String) void
    +render() ReactNode
  }
  class Editor {
    +String value
    +onChange(String) void
    +revealLine(int) void
  }
  class Canvas {
    +Layout layout
    +String selectedId
    +onSelect(String) void
  }
  class Toolbar {
    +onExport(Kind) void
    +onThemeChange(String) void
  }
  class useDiagram {
    <<hook>>
    +DiagramState state
    +setSource(String) void
  }
  App *-- DiagramPage
  DiagramPage *-- Editor
  DiagramPage *-- Canvas
  DiagramPage *-- Toolbar
  DiagramPage ..> useDiagram : calls` },

  { title: 'Event sourcing aggregate', source: `classDiagram
  class AggregateRoot {
    <<abstract>>
    #UUID id
    #long version
    #List~DomainEvent~ pending
    +apply(DomainEvent) void
    +markCommitted() void
  }
  class Account {
    -Money balance
    -boolean frozen
    +deposit(Money) void
    +withdraw(Money) void
    +freeze(reason) void
  }
  class DomainEvent {
    <<abstract>>
    +UUID aggregateId
    +Instant occurredAt
    +long sequence
  }
  class MoneyDeposited {
    +Money amount
  }
  class MoneyWithdrawn {
    +Money amount
  }
  class AccountFrozen {
    +String reason
  }
  class EventStore {
    <<interface>>
    +append(UUID, List~DomainEvent~, long expected) void
    +load(UUID) List~DomainEvent~
  }
  AggregateRoot <|-- Account
  DomainEvent <|-- MoneyDeposited
  DomainEvent <|-- MoneyWithdrawn
  DomainEvent <|-- AccountFrozen
  AggregateRoot o-- DomainEvent : pending
  EventStore ..> DomainEvent : persists` },

  { title: 'HTTP client with middleware', source: `classDiagram
  class HttpClient {
    -List~Middleware~ chain
    -Duration timeout
    +send(Request) Response
    +use(Middleware) HttpClient
  }
  class Middleware {
    <<interface>>
    +handle(Request, Next) Response
  }
  class RetryMiddleware {
    -int maxAttempts
    -Backoff backoff
    +handle(Request, Next) Response
  }
  class AuthMiddleware {
    -TokenSource tokens
    +handle(Request, Next) Response
  }
  class LoggingMiddleware {
    -Logger log
    +handle(Request, Next) Response
  }
  class CircuitBreaker {
    -State state
    -int failureThreshold
    +handle(Request, Next) Response
    +trip() void
    +reset() void
  }
  class Request {
    +String method
    +URI url
    +Map~String,String~ headers
  }
  class Response {
    +int status
    +byte[] body
  }
  HttpClient o-- Middleware
  Middleware <|.. RetryMiddleware
  Middleware <|.. AuthMiddleware
  Middleware <|.. LoggingMiddleware
  Middleware <|.. CircuitBreaker
  HttpClient ..> Request
  HttpClient ..> Response` },

  { title: 'Multi-tenant identity model', source: `classDiagram
  class Tenant {
    +UUID id
    +String slug
    +Plan plan
    +boolean ssoEnforced
  }
  class User {
    +UUID id
    +String email
    +boolean emailVerified
    +Instant lastSeenAt
  }
  class Membership {
    +UUID tenantId
    +UUID userId
    +Instant joinedAt
    +boolean isOwner
  }
  class Role {
    +String name
    +Set~Permission~ permissions
  }
  class Permission {
    +String resource
    +String action
  }
  class ApiKey {
    +UUID id
    +String prefix
    +String hash
    +Instant expiresAt
    +revoke() void
  }
  class IdentityProvider {
    +String issuer
    +Protocol protocol
    +String metadataUrl
  }
  Tenant "1" --> "*" Membership
  User "1" --> "*" Membership
  Membership "*" --> "1..*" Role
  Role "*" --> "*" Permission
  Tenant "1" --> "*" ApiKey
  Tenant "1" --> "0..1" IdentityProvider : sso via` },

  { title: 'Rendering pipeline', source: `classDiagram
  class Parser {
    +parse(String source) DiagramIR
  }
  class DiagramIR {
    +Kind kind
    +List~Node~ nodes
    +List~Edge~ edges
    +List~Group~ groups
  }
  class Enricher {
    +enrich(DiagramIR) DiagramIR
    -inferArchetype(Node) Archetype
    -inferIcon(String label) IconRef
  }
  class LayoutEngine {
    <<interface>>
    +layout(DiagramIR, Theme) LaidOutDiagram
  }
  class ElkLayout {
    -Worker worker
    +layout(DiagramIR, Theme) LaidOutDiagram
  }
  class Renderer {
    +render(LaidOutDiagram, Theme) SvgElement
  }
  class Theme {
    +Palette color
    +Typography type
    +Geometry geometry
  }
  Parser ..> DiagramIR : produces
  Enricher ..> DiagramIR : rewrites
  LayoutEngine <|.. ElkLayout
  LayoutEngine ..> DiagramIR : consumes
  Renderer ..> Theme : reads
  Renderer ..> LayoutEngine : after` },

  { title: 'Notification fan-out', source: `classDiagram
  class NotificationService {
    -List~Channel~ channels
    -PreferenceStore preferences
    +notify(User, Event) void
  }
  class Channel {
    <<interface>>
    +supports(Event) boolean
    +deliver(User, Message) DeliveryResult
  }
  class EmailChannel {
    -SmtpClient smtp
    +deliver(User, Message) DeliveryResult
  }
  class PushChannel {
    -DeviceRegistry devices
    +deliver(User, Message) DeliveryResult
  }
  class SmsChannel {
    -CarrierGateway gateway
    +deliver(User, Message) DeliveryResult
  }
  class SlackChannel {
    -String webhookUrl
    +deliver(User, Message) DeliveryResult
  }
  class Template {
    +String key
    +String locale
    +render(Map~String,Object~) Message
  }
  class Preference {
    +UUID userId
    +String eventType
    +Set~ChannelKind~ enabled
    +QuietHours quietHours
  }
  NotificationService o-- Channel
  Channel <|.. EmailChannel
  Channel <|.. PushChannel
  Channel <|.. SmsChannel
  Channel <|.. SlackChannel
  NotificationService ..> Template : renders
  NotificationService ..> Preference : respects` },

  { title: 'Feature flag evaluation', source: `classDiagram
  class FlagClient {
    -Store store
    -Evaluator evaluator
    +boolean isEnabled(String key, Context)
    +T variation(String key, Context, T fallback)
  }
  class Flag {
    +String key
    +boolean on
    +List~Rule~ rules
    +Variation fallthrough
    +Variation offVariation
  }
  class Rule {
    +List~Clause~ clauses
    +Rollout rollout
    +matches(Context) boolean
  }
  class Clause {
    +String attribute
    +Operator op
    +List~Object~ values
    +boolean negate
  }
  class Rollout {
    +String bucketBy
    +List~WeightedVariation~ variations
    +pick(Context) Variation
  }
  class Context {
    +String key
    +Map~String,Object~ attributes
  }
  class Evaluator {
    +Detail evaluate(Flag, Context)
  }
  FlagClient --> Flag : reads
  FlagClient --> Evaluator
  Flag "1" *-- "*" Rule
  Rule "1" *-- "1..*" Clause
  Rule "1" --> "0..1" Rollout
  Evaluator ..> Context : against` },
]
