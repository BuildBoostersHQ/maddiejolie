-- Press outreach for the dashboard at /dashboard/press.
-- Run once in the Supabase SQL editor (the same project as the prospects table).
-- Nothing is sent from the dashboard. A pitch has to be approved there, then Maddie sends it from her own email.

create table if not exists press_contacts (
  id bigint generated always as identity primary key,
  name text not null,
  outlet text,
  kind text not null default 'journalist' check (kind in ('journalist', 'podcast', 'newsletter')),
  beat text,
  email text,                 -- left empty until a public address is confirmed. Never guessed
  contact_url text,           -- where to find them when there is no email yet
  recent_piece_title text,
  recent_piece_url text,
  status text not null default 'found',  -- found, drafted, approved, sent, followup_1_sent, followup_2_sent, replied, passed
  pitch_subject text,
  pitch_body text,
  followup_1_body text,       -- due 4 days after the pitch was sent
  followup_2_body text,       -- due 9 days after the pitch was sent
  approved_at timestamptz,
  sent_at timestamptz,
  followup_1_sent_at timestamptz,
  followup_2_sent_at timestamptz,
  replied_at timestamptz,
  notes text,
  created_at timestamptz default now(),
  unique (name, outlet)
);

alter table press_contacts enable row level security;
drop policy if exists "Allow all access to press_contacts" on press_contacts;
create policy "Allow all access to press_contacts" on press_contacts for all using (true) with check (true);

-- First batch, found 2026-11-27. Each one has a real recent piece, and every pitch is a draft waiting for approval.
insert into press_contacts (name, outlet, kind, beat, contact_url, recent_piece_title, recent_piece_url, status, pitch_subject, pitch_body, followup_1_body, followup_2_body) values
  ($bb$Beatrice Nolan$bb$, $bb$Fortune$bb$, $bb$journalist$bb$, $bb$Tech reporter. AI and solo founders.$bb$, $bb$https://fortune.com/$bb$, $bb$Solo founders are using AI to do the work of entire teams, but going it alone has limits$bb$, $bb$https://fortune.com/2026/05/18/solo-founders-ai-automation-entire-teams-entrepreneurs/$bb$, 'drafted', $bb$A solo founder using AI for plumbers and roofers, not software$bb$, $bb$Hi Beatrice,

Your piece on solo founders using AI to do the work of entire teams stuck with me, especially the part about where going it alone runs out.

I'm 25 and I run Build Boosters in Miami. My job managing top affiliates at HighLevel ended in August, and I spent the three months since building a system where a contractor pays, fills in one form, and gets a website, a business number and automatic text follow-up built for them, with AI doing most of the work between payment and launch.

The part that might interest you is the customer. My buyers are roofers and plumbers who distrust the word AI, so the AI stays behind the curtain and they just see a site and a phone that texts back. I can also tell you exactly where it breaks and where a person still has to step in.

Would a quick call be useful?

Maddie Jolie
Build Boosters, Miami
buildboosters.com$bb$, $bb$Hi Beatrice, floating this back up in case it got buried. Happy to send screenshots of the whole system running, from payment to a live contractor website, if that would help you decide.

Maddie$bb$, $bb$Hi Beatrice, last note from me on this. If the timing is off I completely understand, and I'd still love to be useful as a source any time you're covering AI and small local businesses.

Maddie$bb$),
  ($bb$Nick Lichtenberg$bb$, $bb$Fortune$bb$, $bb$journalist$bb$, $bb$Business editor. AI founders and small, profitable companies.$bb$, $bb$https://fortune.com/$bb$, $bb$Meet the AI founders using agents to build instantly profitable 3-person companies$bb$, $bb$https://fortune.com/2026/04/18/ai-layoff-became-founder-team-of-3-instant-profit/$bb$, 'drafted', $bb$From a SaaS job to an AI-run agency for contractors in three months$bb$, $bb$Hi Nick,

I read your piece on founders using agents to build tiny companies, and I'm living a version of it right now.

I'm 25 and I run Build Boosters in Miami. My job managing top affiliates at HighLevel ended in August, and I spent the three months since building a system where a contractor pays, fills in one form, and gets a website, a business number and automatic text follow-up built for them, with AI doing most of the work between payment and launch.

My grandfather ran a carpet store in Brooklyn, so I grew up around the kind of owner I'm building for. I'm early, and I'm happy to be honest about what is working, what is not, and what it costs to run.

Would that be a fit for anything you're working on?

Maddie Jolie
Build Boosters, Miami
buildboosters.com$bb$, $bb$Hi Nick, floating this back up in case it got buried. Happy to send screenshots of the whole system running, from payment to a live contractor website, if that would help you decide.

Maddie$bb$, $bb$Hi Nick, last note from me on this. If the timing is off I completely understand, and I'd still love to be useful as a source any time you're covering AI and small local businesses.

Maddie$bb$),
  ($bb$Ben Angel$bb$, $bb$Entrepreneur$bb$, $bb$journalist$bb$, $bb$AI tools for one-person businesses.$bb$, $bb$https://www.entrepreneur.com/author/ben-angel$bb$, $bb$4 AI Prompts to Build a Profitable One-Person Business in 2026$bb$, $bb$https://www.entrepreneur.com/growing-a-business/4-ai-prompts-to-build-a-profitable-one-person-business-in/504846$bb$, 'drafted', $bb$A real example for your one-person business series$bb$, $bb$Hi Ben,

I watched your piece on building a profitable one-person business with AI, and I have a working example outside the usual creator and software crowd.

I'm 25 and I run Build Boosters in Miami. My job managing top affiliates at HighLevel ended in August, and I spent the three months since building a system where a contractor pays, fills in one form, and gets a website, a business number and automatic text follow-up built for them, with AI doing most of the work between payment and launch.

I can show the whole thing on screen: what the AI does, what I still do by hand, and what it costs a month. If a teardown of a small local-services business would be useful for a future video, I'm in.

Maddie Jolie
Build Boosters, Miami
buildboosters.com$bb$, $bb$Hi Ben, floating this back up in case it got buried. Happy to send screenshots of the whole system running, from payment to a live contractor website, if that would help you decide.

Maddie$bb$, $bb$Hi Ben, last note from me on this. If the timing is off I completely understand, and I'd still love to be useful as a source any time you're covering AI and small local businesses.

Maddie$bb$),
  ($bb$Tommy Mello$bb$, $bb$The Home Service Expert Podcast$bb$, $bb$podcast$bb$, $bb$Home service owners. Growth, sales and operations.$bb$, $bb$https://homeserviceexpert.com$bb$, $bb$How a Home Service Owner's Cheapest Hire Is Now His Biggest Revenue Line$bb$, $bb$https://homeserviceexpert.com$bb$, 'drafted', $bb$Guest idea: what a small shop should automate first$bb$, $bb$Hi Tommy,

Your episode on a home service owner's cheapest hire turning into his biggest revenue line is the conversation I keep having with small shops.

I'm 25 and I run Build Boosters in Miami. My job managing top affiliates at HighLevel ended in August, and I spent the three months since building a system where a contractor pays, fills in one form, and gets a website, a business number and automatic text follow-up built for them, with AI doing most of the work between payment and launch.

Your listeners at the 1 to 10 truck stage are the ones I talk to all day. I could give them a plain list of what to automate first, what to leave alone, and how to tell if an agency is charging them for things software now does on its own.

Would that be a fit for the show?

Maddie Jolie
Build Boosters, Miami
buildboosters.com$bb$, $bb$Hi Tommy, floating this back up in case it got buried. I can send a short list of topics your listeners could use the same day, like what a contractor should automate first and what to leave alone.

Maddie$bb$, $bb$Hi Tommy, last note from me on this. If the calendar is full I completely understand, and the offer stands whenever a guest slot opens up.

Maddie$bb$),
  ($bb$Adam Sylvester$bb$, $bb$Masters of Home Service (Jobber)$bb$, $bb$podcast$bb$, $bb$Home service owners scaling their business. Guest applications are open.$bb$, $bb$https://www.getjobber.com/podcast/$bb$, $bb$Scale Past $1M by Dialing in These Systems$bb$, $bb$https://www.getjobber.com/podcast/$bb$, 'drafted', $bb$Guest idea: the systems a small shop needs before the big ones$bb$, $bb$Hi Adam,

I listened to the episode on scaling past $1M by dialing in systems, and I work with the owners who are a few steps before that.

I'm 25 and I run Build Boosters in Miami. My job managing top affiliates at HighLevel ended in August, and I spent the three months since building a system where a contractor pays, fills in one form, and gets a website, a business number and automatic text follow-up built for them, with AI doing most of the work between payment and launch.

My system connects to Jobber, so I've spent a lot of time on what should happen after a job is marked done: the review ask, the photo, the follow-up. I could walk your listeners through the small set of systems worth setting up before they hire anyone to do marketing.

I'll send in the guest application too. Would this be a fit?

Maddie Jolie
Build Boosters, Miami
buildboosters.com$bb$, $bb$Hi Adam, floating this back up in case it got buried. I can send a short list of topics your listeners could use the same day, like what a contractor should automate first and what to leave alone.

Maddie$bb$, $bb$Hi Adam, last note from me on this. If the calendar is full I completely understand, and the offer stands whenever a guest slot opens up.

Maddie$bb$),
  ($bb$Tersh Blissett$bb$, $bb$Service Business Mastery$bb$, $bb$podcast$bb$, $bb$HVAC, plumbing and electrical owners. Automation and AI.$bb$, $bb$https://www.iheart.com/podcast/269-service-business-mastery-f-93600135$bb$, $bb$Episode with Ari Meisel of Less Doing$bb$, $bb$https://www.iheart.com/podcast/269-service-business-mastery-f-93600135$bb$, 'drafted', $bb$Guest idea: AI agents running a contractor agency, shown end to end$bb$, $bb$Hi Tersh,

Your conversation with Ari Meisel was right up my alley, and since the show goes deep on automation and AI agents I think I have something your listeners have not seen yet.

I'm 25 and I run Build Boosters in Miami. My job managing top affiliates at HighLevel ended in August, and I spent the three months since building a system where a contractor pays, fills in one form, and gets a website, a business number and automatic text follow-up built for them, with AI doing most of the work between payment and launch.

I can open it up and show the real thing: which steps the AI runs, where I make it stop and wait for a person, and the mistakes I made wiring it together.

Would that be a fit for the show?

Maddie Jolie
Build Boosters, Miami
buildboosters.com$bb$, $bb$Hi Tersh, floating this back up in case it got buried. I can send a short list of topics your listeners could use the same day, like what a contractor should automate first and what to leave alone.

Maddie$bb$, $bb$Hi Tersh, last note from me on this. If the calendar is full I completely understand, and the offer stands whenever a guest slot opens up.

Maddie$bb$),
  ($bb$Mandeep Bhalla$bb$, $bb$Born For The Trades$bb$, $bb$podcast$bb$, $bb$Weekly show for home services business owners.$bb$, $bb$https://www.iheart.com/podcast/269-born-for-the-trades-a-home-110486376/$bb$, $bb$Live from EPIC 2026 with AJ Jain, co-founder and CEO of Broccoli AI$bb$, $bb$https://www.iheart.com/podcast/269-born-for-the-trades-a-home-110486376/$bb$, 'drafted', $bb$Guest idea: AI for the contractor who hates the word AI$bb$, $bb$Hi Mandeep,

I caught your EPIC 2026 conversation with AJ Jain from Broccoli AI, and I'd love to offer the view from the small end of the market.

I'm 25 and I run Build Boosters in Miami. My job managing top affiliates at HighLevel ended in August, and I spent the three months since building a system where a contractor pays, fills in one form, and gets a website, a business number and automatic text follow-up built for them, with AI doing most of the work between payment and launch.

The owners I talk to are still on the job and answering the phone themselves, and they shut down when they hear AI. I could share how I explain it to them, what they say yes to, and what a small shop should set up first.

Would that be a fit for the show?

Maddie Jolie
Build Boosters, Miami
buildboosters.com$bb$, $bb$Hi Mandeep, floating this back up in case it got buried. I can send a short list of topics your listeners could use the same day, like what a contractor should automate first and what to leave alone.

Maddie$bb$, $bb$Hi Mandeep, last note from me on this. If the calendar is full I completely understand, and the offer stands whenever a guest slot opens up.

Maddie$bb$),
  ($bb$Colton Bjornson$bb$, $bb$The Contractor Compass$bb$, $bb$podcast$bb$, $bb$Growth and profit for home service owners. Recent AI coverage.$bb$, $bb$https://podcasts.apple.com/podcast/id1724256618$bb$, $bb$What AI means for home service marketing, sales, financing and SEO going into 2026$bb$, $bb$https://podcasts.apple.com/podcast/id1724256618$bb$, 'drafted', $bb$Guest idea: what AI changes for the smallest contractors$bb$, $bb$Hi Colton,

I listened to your episode with Thomas Murphy and Broc Fletcher on what AI means for home service marketing, and I can add the part about the smallest shops.

I'm 25 and I run Build Boosters in Miami. My job managing top affiliates at HighLevel ended in August, and I spent the three months since building a system where a contractor pays, fills in one form, and gets a website, a business number and automatic text follow-up built for them, with AI doing most of the work between payment and launch.

I could walk through what an owner with a couple of trucks should do about his website, his Google profile and his missed calls now that AI is in the mix, in plain terms he can act on that week.

Would that be a fit for the show?

Maddie Jolie
Build Boosters, Miami
buildboosters.com$bb$, $bb$Hi Colton, floating this back up in case it got buried. I can send a short list of topics your listeners could use the same day, like what a contractor should automate first and what to leave alone.

Maddie$bb$, $bb$Hi Colton, last note from me on this. If the calendar is full I completely understand, and the offer stands whenever a guest slot opens up.

Maddie$bb$)
on conflict (name, outlet) do nothing;
