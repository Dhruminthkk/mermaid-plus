import type { Example } from './types'

export const sankey: Example[] = [
  { title: 'Signup funnel', source: `sankey-beta
Landing page,Started signup,4260
Landing page,Left,7540
Started signup,Verified email,3510
Started signup,Abandoned,750
Verified email,Invited a colleague,1980
Verified email,Solo,1530
Invited a colleague,Imported data,1240
Invited a colleague,Stalled,740
Solo,Imported data,410
Solo,Stalled,1120
Imported data,Activated,1090
Imported data,Stalled,560` },

  { title: 'Cloud spend', source: `sankey-beta
Total spend,Compute,42800
Total spend,Data,34600
Total spend,Network,12300
Compute,Production cluster,28900
Compute,Staging cluster,8100
Compute,Batch and CI,5800
Data,Managed Postgres,18600
Data,Object storage,9400
Data,Managed Kafka,6600
Network,CDN,7100
Network,Cross-zone transfer,3400
Network,NAT gateways,1800` },

  { title: 'Support ticket flow', source: `sankey-beta
Inbound,Self-serve deflected,1840
Inbound,Tier 1,2410
Tier 1,Resolved by tier 1,1520
Tier 1,Tier 2,890
Tier 2,Resolved by tier 2,610
Tier 2,Engineering,280
Engineering,Bug fixed,190
Engineering,Working as intended,60
Engineering,Backlog,30` },

  { title: 'Request outcomes', source: `sankey-beta
Requests,Cache hit,6420000
Requests,Cache miss,1580000
Cache miss,Database read,1210000
Cache miss,Upstream call,370000
Database read,200 OK,1180000
Database read,5xx,30000
Upstream call,200 OK,352000
Upstream call,Timeout,18000
Cache hit,200 OK,6420000` },

  { title: 'Revenue to margin', source: `sankey-beta
Revenue,Cost of revenue,3120000
Revenue,Gross profit,4880000
Cost of revenue,Cloud infrastructure,1740000
Cost of revenue,Support,860000
Cost of revenue,Payment fees,520000
Gross profit,Engineering,2140000
Gross profit,Sales and marketing,1490000
Gross profit,General and admin,610000
Gross profit,Operating margin,640000` },

  { title: 'Energy mix to consumption', source: `sankey-beta
Wind,Grid,3120
Solar,Grid,1840
Nuclear,Grid,2260
Gas,Grid,2980
Imports,Grid,640
Grid,Homes,4180
Grid,Industry,3260
Grid,Transport,1420
Grid,Transmission losses,780
Grid,Exports,1200` },

  { title: 'Release pipeline outcomes', source: `sankey-beta
Commits,Passed CI,1840
Commits,Failed CI,410
Passed CI,Merged,1690
Passed CI,Closed unmerged,150
Merged,Deployed to staging,1690
Deployed to staging,Promoted to production,1420
Deployed to staging,Rolled back in staging,270
Promoted to production,Stable,1358
Promoted to production,Rolled back in production,62` },

  { title: 'Warehouse storage lifecycle', source: `sankey-beta
Raw events,Staging models,184
Raw events,Deleted at 90 days,96
Staging models,Core marts,62
Staging models,Dropped,41
Core marts,Dashboards,28
Core marts,Exports,13
Core marts,Model training,9
Dashboards,Archived,11
Exports,Archived,6` },

  { title: 'Traffic by source and outcome', source: `sankey-beta
Organic search,Product pages,412000
Paid search,Product pages,186000
Direct,Product pages,268000
Social,Product pages,94000
Product pages,Added to basket,196000
Product pages,Left,764000
Added to basket,Started checkout,118000
Added to basket,Abandoned basket,78000
Started checkout,Paid,86000
Started checkout,Abandoned checkout,32000` },

  { title: 'Engineering time', source: `sankey-beta
Engineer weeks,Roadmap features,128
Engineer weeks,Reliability and on-call,46
Engineer weeks,Bug fixes,34
Engineer weeks,Migration work,30
Engineer weeks,Interviews and onboarding,18
Engineer weeks,Meetings and planning,16
Roadmap features,Shipped,92
Roadmap features,Cut,21
Roadmap features,Still in flight,15
Migration work,Shipped,30` },
]
