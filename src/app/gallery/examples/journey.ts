import type { Example } from './types'

export const journey: Example[] = [
  { title: 'First-time signup', source: `journey
  title Signing up for a team plan
  section Discover
    Read a comparison article: 4: Visitor
    Land on the pricing page: 3: Visitor
    Start a trial without a card: 5: Visitor
  section Set up
    Verify the email address: 3: Admin
    Invite three colleagues: 4: Admin
    Connect the first integration: 2: Admin
    Import existing data: 2: Admin
  section First value
    See the first report: 5: Admin, Colleague
    Share it with a manager: 5: Admin
  section Convert
    Hit the trial limit: 2: Admin
    Enter card details: 3: Admin
    Receive the first invoice: 4: Admin` },

  { title: 'Checkout on mobile', source: `journey
  title Buying on a phone
  section Browse
    Tap an ad: 3: Shopper
    Scroll the product page: 4: Shopper
    Read reviews: 4: Shopper
  section Decide
    Choose a size: 3: Shopper
    Add to the basket: 5: Shopper
    See the delivery estimate: 4: Shopper
  section Pay
    Guest checkout: 4: Shopper
    Type the address: 1: Shopper
    Pay with a wallet: 5: Shopper
    Bank verification screen: 2: Shopper
  section After
    Order confirmation: 5: Shopper
    Tracking link that works: 4: Shopper` },

  { title: 'Reporting a bug', source: `journey
  title A customer reports a bug
  section Notice
    Hit the error: 1: Customer
    Retry and hit it again: 1: Customer
    Search the help centre: 2: Customer
  section Report
    Find the contact form: 2: Customer
    Describe the problem: 3: Customer
    Attach a screenshot: 3: Customer
  section Handling
    Auto-acknowledgement: 3: Customer
    Agent asks for the account id: 2: Customer, Agent
    Reproduced internally: 4: Agent, Engineer
  section Resolution
    Fix shipped: 5: Engineer
    Customer told it is fixed: 5: Customer, Agent
    Asked for a rating: 3: Customer` },

  { title: 'On-call night shift', source: `journey
  title Being on call
  section Handover
    Read the handover notes: 4: Engineer
    Check what is deploying tonight: 3: Engineer
  section Paged
    Page at 02:41: 1: Engineer
    Find the runbook: 3: Engineer
    Runbook is out of date: 1: Engineer
    Ask in the incident channel: 2: Engineer, Secondary
  section Mitigate
    Roll back the change: 4: Engineer
    Confirm metrics recovered: 5: Engineer
    Update the status page: 4: Engineer
  section After
    Write the timeline while it is fresh: 3: Engineer
    Go back to bed: 2: Engineer
    Postmortem next morning: 4: Engineer, Team` },

  { title: 'Enterprise procurement', source: `journey
  title Buying software at a large company
  section Interest
    Champion finds the product: 5: Champion
    Runs a trial in a corner: 4: Champion
    Shows a colleague: 5: Champion, Colleague
  section Justify
    Build a business case: 3: Champion
    Present to the manager: 3: Champion, Manager
    Get budget approval: 2: Manager, Finance
  section Review
    Security questionnaire: 1: Champion, Security
    Penetration test report requested: 2: Vendor, Security
    Legal redlines the contract: 1: Legal, Vendor
    DPA and subprocessor list: 2: Legal
  section Close
    Signature: 4: Manager
    Kickoff scheduled: 5: Champion, Vendor` },

  { title: 'Developer first hour', source: `journey
  title A developer tries the API
  section Arrive
    Read the quickstart: 4: Developer
    Copy the curl example: 5: Developer
    It works first time: 5: Developer
  section Build
    Find the SDK: 4: Developer
    Authenticate: 3: Developer
    Hit a 429 with no Retry-After: 1: Developer
    Find the rate limit docs: 2: Developer
  section Ship
    Handle pagination: 3: Developer
    Test against the sandbox: 4: Developer
    Go live: 5: Developer
  section Operate
    Webhook signature verification: 3: Developer
    Read the changelog: 4: Developer` },

  { title: 'Returning a parcel', source: `journey
  title Returning something
  section Decide
    Item does not fit: 1: Customer
    Find the returns policy: 2: Customer
    Start a return online: 4: Customer
  section Prepare
    Choose a reason: 4: Customer
    Print a label: 2: Customer
    No printer at home: 1: Customer
    Use a QR code at the drop-off: 5: Customer
  section Send
    Drop off at a locker: 5: Customer
    Get a receipt: 4: Customer
  section Refund
    Tracking shows delivered: 4: Customer
    Wait for the warehouse: 2: Customer
    Refund confirmed: 5: Customer` },

  { title: 'Migrating to a new tool', source: `journey
  title Moving the team to a new tracker
  section Preparation
    Announce the change: 2: Lead
    Map the old workflow: 3: Lead, Admin
    Run a pilot with one squad: 4: Squad
  section Migration
    Export from the old tool: 2: Admin
    Import and fix broken links: 1: Admin
    Recreate saved views: 2: Squad
  section Adoption
    First planning session in the new tool: 3: Squad
    Someone still uses the old one: 1: Lead
    Old tool set to read-only: 4: Admin
  section Settled
    Team stops mentioning the old tool: 5: Squad
    Reporting is better than before: 5: Lead` },

  { title: 'Patient appointment', source: `journey
  title Booking and attending an appointment
  section Book
    Try to call the clinic: 1: Patient
    Use the online booking instead: 4: Patient
    Choose a slot: 4: Patient
    Confirmation by text: 5: Patient
  section Before
    Reminder two days ahead: 5: Patient
    Complete the pre-visit form: 3: Patient
    Find parking: 1: Patient
  section Visit
    Check in at the kiosk: 4: Patient
    Wait 25 minutes past the slot: 1: Patient
    Consultation: 5: Patient, Clinician
  section After
    Notes in the record the same day: 4: Clinician
    Prescription sent to the pharmacy: 5: Patient
    Follow-up booked: 4: Patient` },

  { title: 'Password reset', source: `journey
  title Getting back into an account
  section Locked out
    Password does not work: 1: User
    Try three variations: 1: User
    Find the reset link: 3: User
  section Reset
    Enter the email address: 4: User
    Wait for the email: 2: User
    Email lands in spam: 1: User
    Open the link: 4: User
  section New password
    Password manager suggests one: 5: User
    Policy rejects it: 1: User
    Second attempt accepted: 3: User
  section Back in
    Signed in automatically: 5: User
    Other sessions signed out: 4: User
    Notified by email: 4: User` },
]
