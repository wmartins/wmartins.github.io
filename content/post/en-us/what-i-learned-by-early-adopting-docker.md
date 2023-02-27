---
title: "What I Learned by Early Adopting Docker"
date: 2017-11-28T21:09:43-03:00
author: "William Martins"
tags: ["docker", "orchestration"]
draft: false
---

The year is 2015, I started working as software engineer in this new team that
was focused on delivering new experiences with top notch technology. This was
also an year when microservices began to be a thing, and, with that, Docker
being the *de facto* containerization tool.

At this time, Docker was on release `1.6` or `1.7`, and few people were using it
to deploy applications. Lots of those were POCs, and most of the blog posts
included some "strange" things (not the Netflix title) there, like the `fig`
command (which became `docker-compose`), and lots of lines in `yml` code.

It was a time where most of the "real world problems" were still being found for
Docker deployments. Things like networking, orchestration, high availability,
and so on. So, we made a few bad decisions that made us learn a lot (at least
what not to do), but that we would like someone had told us that were bad ideas.

This blog post will cover some of those bad decisions, explaining why they're
bad, and what we should've done.

## Outlining the Application

Our application, in a high level, was designed to be high available, which means
that, at least, we needed to run our application in more than one machine. That
said, we needed to be able to run replicas of containers, and provide a
mechanism to use those replicas in the best way we can.

In our case, we decided to use [**OpenResty**](https://openresty.org/en/) (Nginx
+ Lua Scripts) as a reverse proxy/API gateway/load balancer, balancing the
traffic between the containers. Something like that:

```conf
upstream first-microservice {
    server <FIRST-SERVER-IP>:8877;
    server <SECOND-SERVER-IP>:8877;
}
```

After we decided what goes where, we then took two bad decisions: orchestrate
the application using [**Jenkins**](https://jenkins.io/) and creating a
`configuration` volume, which I'll cover in next sections.

## Orchestrating Using Jenkins

**Jenkins** is an awesome tool. It does its job really well:

> The leading open source **automation** server, Jenkins provides hundreds of
> plugins to support building, deploying and automating any project.

As you see, it's an **automation** server. Putting it in another way, it's
**not** an orchestration server. But, for some reason, we thought it was.

So, our deployment jobs now had the IPs of all our machines, containing a Groovy
script to associate an IP with container names (in order to know what to
deploy). Then, a generic deploy job just grabbed the IP, the names, ssh'd into
the machines and *voila*, let `docker-compose up -d <CONTAINERS>` do its job.

It seems good, right? It felt good. It really did, but it started to become hard
to manage. Every new microservice we added, we needed to edit this Jenkins job
and add the new microservice in **all** environments (we have 2 QA environments,
1 *production like* environment and 1 production environment). And, there was **no
space for mistakes** here. If you edit it wrong, your service will go to the
wrong machine, and the application might not work. Also, if you put, for
example, two applications that consume lots of memory in the same machine, you
might compromise this machine, just because you chose the wrong place to put
your microservice.

So, as I said before, we found out that Jenkins is not an orchestration tool.
It doesn't handle unhealthy services/machines, it doesn't handle dynamic
adding/removing replicas, it doesn't monitor your replicas. It just automates
stuff.

Now, the plan is to move this responsibility from Jenkins to **Docker Swarm**,
which will also gives us other cool features that fix more of our problems.

There are other tools, like **Kubernetes** and **Nomad**, that also solves this
in a fashion way.

## No Service Discovery/Hardcoded IPs

Service discovery is one of the most important aspects of a successful
microservices architecture. Without it, you'll struggle when adding/removing
replicas from the application.

We found out that after having some problems on some of our machines (our
infrastructure team had an outage on a datacenter, which took half of our
machines down). In that time, we wanted to add more replicas to make the
application high available again. It was really hard to do:

1. Editing IPs in Jenkins and config files
2. Going in Jenkins jobs to modify where to deploy stuff
3. Deploy and check if everything is running fine

Then, after the machines went up again, we needed to do the reverse process,
editing files, modifying Jenkins and deploying, all over again.

It's not that hard to setup a `DNS` or a service discovery system. So, don't let
the "lets ship it soon" make you do things that will only cause you trouble. Or,
if you do, at least know what you need to do to make it right.

## Configuration as a Shared Volume

All applications, at some point, need some kind of configuration. Most likely,
the application, when in production, will need to behave differently than in the
local machine, or in a low level (testing) environment. This requires us to have
some level of **configuration management**.

Back at that time, the way we solved it was to create a **configuration
volume**, that is a simple Docker container that we use to store configuration
files per environment. Then, at deployment time, we just grab the correct
configuration container and we deploy it using `--volumes-from` directive.

It seemed to be a good idea, but we started realizing that it doesn't scale.
First of all, we were coupling all microservices with this configuration
container, and we needed to always remember to edit the files in it. Second, our
microservices weren't really standalone, as we couldn't run it without running
this other container together. Third, if two containers used the version
`2.1.0` of the configuration container, they would end up using exactly the same
files. Putting it in another way, if, by mistake, one container edits the wrong
file, it could affect the other container. To finish, it starts to be really
hard to manage which is the correct configuration version to run with each
microservice.

There are some ways to do it correctly. One of the easiest is to use
**environment variables** for all those configuration objects. If the
application requires a string to connect to the database, provide a
`DB_CONNECTION_STRING` env var and so on.

The other way of using it is to use a **configuration management tool** that let
you externalize your configuration. Tools like **Consul** with its key-value
storage solve that for you. The only downside is that you'll need to modify your
applications to connect to that tool to grab the values. The cool thing about
it is that you can, in the middle of the day, change some configuration and,
if your code supports it, your application will notice that and will adapt
itself. It's really nice.

## Wrapping Up

It was really hard to early adopt Docker. We made a few poor decisions that
we're not proud of. Also, those decisions made our jobs pretty hard. If, at that
time, we discussed more and researched more, we would probably doing things
better.

That said, my advice if you're adopting Docker (but that can be used to
anything) is to study a lot, discuss in forums and experiment with it. Try to
implement all your use cases and think what you'll need when running in
production, and check if you have the tools and knowledge to make you go
comfortably to production.

Hope it was useful!
