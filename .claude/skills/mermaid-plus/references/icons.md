# Icon reference

357 icons across six packs. Reference them as `<pack>:<name>`; a bare name resolves
to the `general` pack. `icon=none` suppresses the icon entirely.

**Never guess a name.** An unknown icon reference is dropped silently — the node
simply renders without an icon and nothing warns you. If the icon you want isn't in
this list, pick the nearest one that is, or use `none`.

## Inference comes first

You usually don't need an icon directive at all. When a label names a real
technology as a whole word, that technology's mark is used automatically:

> postgres/postgresql/psql/rds · mysql · mariadb · mongo/mongodb · redis · sqlite ·
> cassandra · elasticsearch/opensearch · neo4j · snowflake · databricks · prisma ·
> kafka · rabbitmq/rabbit · nats · nginx · envoy · kubernetes/k8s/eks/gke/aks ·
> docker · helm · terraform · ansible · jenkins · gitlab · bitbucket · github · gcp ·
> azure · heroku · vercel · netlify · cloudflare · datadog · sentry · grafana ·
> prometheus · opentelemetry/otel · stripe · twilio · sendgrid · mailgun · paypal ·
> auth0 · okta · firebase · supabase · algolia · shopify · salesforce · hubspot ·
> zapier · slack · notion · figma · jira · openai/gpt · and the language/framework
> names (react, vue, angular, svelte, nextjs, nodejs, deno, bun, python/django/flask/
> fastapi, rust, java/spring, kotlin, swift, php/laravel, ruby/rails, dotnet,
> graphql, redux, tailwind, vite, webpack, jest, playwright, storybook) · plus
> apple/ios, android, chrome, firefox, safari, linux, ubuntu, debian.

AWS marks work differently, and more safely: they apply **only when the label also
contains the word `aws`**. `AWS S3 Bucket` gets the S3 mark; `S3 Compatible Object
Storage` and `Lambda function` get nothing, by design — see the comment in
`src/core/enrich/icon.ts`. The AWS service names are: lambda, s3, dynamodb, sqs,
sns, ec2, ecs, eks, rds, aurora, redshift, cloudfront, route53, cloudwatch, kinesis,
athena, glue, cognito, fargate, api-gateway, step-functions, elasticache, sagemaker,
amplify, appsync.

Deliberately **not** matched at all, because they are ordinary English before they
are products: next, node, segment, linear, actions.

## The tech pack is not guarded — check labels that name what they aren't

Unlike AWS, the ~90 `tech` names match on the bare word. A label that mentions a
technology it is not gets that technology's logo:

| Label | Gets | Correct? |
|---|---|---|
| `Postgres Compatible Store` | tech:postgresql | no — it isn't Postgres |
| `Mongo Compatible API` | tech:mongodb | no |
| `Okta Migration Tool` | tech:okta | no — it's the thing leaving Okta |
| `Slack Replacement` | tech:slack | no |
| `Elasticsearch Alternative` | tech:elasticsearch | no |
| `Not Stripe` | tech:stripe | emphatically no |

Adjacent tokens are also joined, so `Next.js` resolves as `nextjs`. When a label
names a technology it isn't, use `icon=none` or a neutral glyph — shipping a
vendor's logo on a competitor's box is a factual error, not a cosmetic one.

## Archetype defaults

With no icon directive and no technology match, the archetype supplies a glyph:

| Archetype | Default icon |
|---|---|
| service | general:server |
| database | general:database |
| queue | general:list-ordered |
| storage | general:hard-drive |
| user | general:user |
| external | general:globe |


## Full catalogue

### general (179)
server database layers hard-drive user users globe cloud cpu box package mail bell lock key shield settings zap activity chart-bar pie-chart file file-text folder image video message-square phone smartphone monitor laptop tablet terminal code git-branch git-commit-horizontal git-merge network wifi radio rss share-2 link external-link search filter list list-ordered calendar clock timer map map-pin navigation truck plane house building store shopping-cart credit-card dollar-sign wallet briefcase clipboard check circle-check x circle-x triangle-alert circle-alert info sticky-note bookmark tag flag star heart eye pencil trash download upload refresh-cw rotate-cw repeat shuffle play pause square circle triangle hexagon workflow boxes container webhook plug cable router bot brain sparkles flame droplet thermometer gauge sliders-horizontal inbox send archive printer camera mic headphones cast table grid-2x2 layout-dashboard panel-left component puzzle wrench hammer scroll-text book lightbulb rocket scan-face scan-line qr-code binary square-function variable braces regex cookie table-properties database-zap server-cog server-crash cloud-cog cloud-upload cloud-download arrow-right arrow-left-right message-circle mails bell-ring lock-keyhole shield-check shield-alert key-round log-in log-out user-check user-cog contact id-card languages globe-lock earth radar satellite anchor ship bus car bike train-front warehouse factory landmark hospital school university library gavel scale

### tech (93)
postgresql mysql mariadb mongodb redis sqlite cassandra elasticsearch neo4j snowflake databricks prisma kafka rabbitmq nats nginx envoy docker kubernetes helm terraform ansible jenkins github-actions github gitlab bitbucket gcp azure heroku vercel netlify cloudflare stripe twilio sendgrid mailgun paypal visa mastercard auth0 okta firebase supabase algolia datadog sentry grafana prometheus opentelemetry react vue angular svelte nextjs nodejs deno bun python rust java kotlin swift php ruby dotnet typescript javascript graphql redux tailwind vite webpack jest playwright storybook openai slack notion figma jira shopify salesforce hubspot zapier apple android chrome firefox safari linux ubuntu debian

### aws (65)
amplify api-gateway app-mesh appflow appsync athena aurora backup batch certificate-manager cloudformation cloudfront cloudsearch cloudtrail cloudwatch codebuild codecommit codedeploy codepipeline codestar cognito config documentdb dynamodb ec2 ecs eks elastic-beanstalk elastic-cache elasticache elb eventbridge fargate glacier glue iam keyspaces kinesis kms lake-formation lambda lightsail mobilehub mq msk neptune open-search opsworks quicksight rds redshift route53 s3 secrets-manager ses shield sns sqs step-functions systems-manager timestream vpc waf xray logo

### gcp (4)
functions platform run logo

### azure (3)
microsoft-azure azure azure-icon

### k8s (13)
kubernetes helm prometheus grafana docker-icon terraform-icon nginx redis postgresql mongodb kafka rabbitmq-icon elasticsearch

