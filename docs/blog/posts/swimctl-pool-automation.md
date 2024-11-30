---
title: >-
    Building an Open Pool Automation Platform
date: 2024-11-29
---

When I bought my home a few years ago, a pool was an absolute requirement for
me. Of course, I knew nothing about how pools operate, nor how to maintain
them, but quickly found myself drinking from a firehose of knowledge on the
subject. To begin with, the existing automation system (responsible for
scheduling the pump, running the heater, switching valves for different modes
of operation, etc.) was not in good shape. 20 years old and only partly
functional, it was far from a modern convenience.

To make matters worse, finding parts or options for upgrading was a maze of
corporate red tape. The manufacturer actually restricts purchases of any
replacement parts to licensed resellers, a practice I find particularly
consumer-hostile.

In the short term, I was able to track down some of the malfunctions to an old
keypad which sat next to the spa and was destroyed by the Florida sun enough to
let water in and cause some short circuting. Removing this brought the lights
and heater control back online, but it was still janky, and prone to frustrate
me as much as allow me to relax.

Things escalated after I ended up with a new pump and heater, which weren't
really compatible with the old system. I'd been thinking about putting a
replacement in place for a while, but this pushed me to get off my butt and
start tinkering. The idea of interacting with the physical world through
computers has always intrigued me. I'm a big fan of software automation, and
this seemed like the perfect excuse to try something a bit more concrete.

<!-- more -->


## Goals

* Use Off-the-Shelf Parts

  The biggest requirement was to build the entire system using readily
  available components. I wanted to ensure that any part of the system could be
  easily replaced without jumping through hoops or dealing with proprietary
  restrictions. This makes maintenance straightforward and encourages future
  experimentation.

* A Code-First Methodology

  I'm working hard to ensure that as much of the configuration as possible is
  stored in a Git repository and deployed via automation tools. This means I
  can rebuild the entire system quickly because the build process is almost
  entirely automated. A code-first approach also serves as excellent
  documentation, providing a clear record of how everything fits together.


## Major Hardware Components

* Raspberry Pi

  For the brain of the operation, I chose a Raspberry Pi. Its ubiquity in IoT
  and automation applications made it an obvious choice. It's inexpensive,
  widely supported, and comes with the necessary connectivity options like I²C
  and GPIO, making it well-suited for controlling and gathering data from
  external components.

  I originally considered an Arduino, or other microcontroller, but the
  availability of software like Node-Red pushed me to use a full single board
  computer. I'm thankful that I made this choice, because it's been a lot of
  work getting to where I am _without_ having to write the amount of custom
  code that a microcontroller would have required.

  Looking down the road, the one to one compatibility with Pi compute modules
  means I can take advantage of the industry's enthusiasm for that platform.
  There are already [many solutions](https://pipci.jeffgeerling.com/boards_cm)
  out there which use the CM4 for compute. I imagine a future iteration may end
  up using something akin to the [Techbase ModBerry 500
  CM4](https://modberry.techbase.eu/compute-module-4/), though I'd prefer a
  bit slimmer form factor.

  The overall flexibility of the Pi ecosystem allows for taking projects from
  initial prototyping to a fully productionalized solution, all while using the
  same platform.

* Sequent Microsystems Relay Boards

  Relays are at the heart of most of what the system does. I looked around at
  many different solutions and eventually stumbled upon [Eight Relays 4A/120V
  8-Layer Stackable
  HAT](https://sequentmicrosystems.com/products/8-relays-stackable-card-for-raspberry-pi).
  Up to eight of these can be stacked onto a single Pi, and using two of them
  gave me a total of 16 SPDT relays and a bonus RS-485/MODBUS port. They
  integrate seamlessly with the Raspberry Pi, via I²C, and they have pre-built
  nodes for Node-Red, plus among a nubmer of other integrations. All told, they
  are a very an efficient choice for managing multiple devices with very little
  effort.

* External Relays and other 24VAC components

  The pool and spa lights run too close to the 4 amp rating of the relays on
  the Sequent Microsystems board, so I added some extra Schneider Electric
  relays to control them. The actuators for the valves run on 24VAC, requiring
  that I add a transformer to the mix, so I chose to use this voltage for the
  relay coils, as well.

  Finding the right transformer for these components was a bit of a challenge.
  It took me some time to choose one, and I'm still not entirely sure I made
  the best choice. I think I might be able to switch it out for a smaller unit
  without losing any functionality, but more math is required.

* Enclosure

  For the enclosure, I opted for an IP67 Plastic Enclosure from Gratury purchased
  on Amazon. This enclosure features a removable backplate with a grid of
  pre-formed holes, making it easy to mount components securely. The IP67 rating,
  plus waterproof cable glands ensure that the system is well-protected from the
  elements. I opted for the 20″ × 16.1″ × 7.9″ box, which fit quite nicely in the
  space left by the old system.


* Circuit Protection

  Because the automation system functions, partially, as a load center for the
  pool equipment, each major section of the panel has dedicated circuit
  breakers. This not only allows for the use of smaller gauge (less expensive
  and more flexible) wire but also enables isolation for troubleshooting
  purposes. By being able to cut power to specific sections, I can work on the
  system more safely and efficiently.


## Software Architecture

Node-RED is the core of the controller, handling all events, logic, and interfacing
with Home Assistant. I chose Node-RED because of its strong community support
and widespread use in similar automation solutions. It provided the flexibility
and functionality I needed without a steep learning curve.

Node-RED is installed as a pod running on Kubernetes. Running K8s on the Pi
might sound like overkill, but it aligns with my goal of configuration as code.
Kubernetes provides an abstraction layer that allows me to tie in many
pre-existing automation mechanisms to handle provisioning and manage the system
more effectively.

Integration with Home Assistant is facilitated through
[MQTT](https://mqtt.org/) using [dynamic
discovery](https://www.home-assistant.io/integrations/mqtt/#mqtt-discovery).
Node-RED sends metadata about the entities it exposes. It then listens for
control messages via MQTT "control" topics, allowing for real-time control.
Responses on corresponding "state" topics allow Node-Red to update Home
Assistant as to the current state of the controller and its exposed devices.

Implementing this integration was challenging at first. The MQTT discovery
specification is well documented, but I had difficulty finding any guidance on
implementation via Node-Red. It took some experimenting to understand how to
collect metadata for each component, how to structure the messages and topics
properly, and how and when to trigger the discovery messages.


## Implementation

During the transition from the old automation unit to the new panel, I ensured
that the most critical component (the pump) was only offline for a short while,
but I allowed myself time to get everything else back up and running. This
cautious approach minimized risk and allowed me to focus on implementing
and testing each component thoroughly.

Progress has been a bit slow, but steady. Programming in Node-RED required a
different way of thinking from Python, or Java, and integrating with Home
Assistant required a lot of reading and looking at what other people have done.
Overall, though, I'm pleased with how it's coming together. I expect to achieve
full functionality (if not stability) within the next few weeks. Technical

* Integrating Node-RED with MQTT

One of the initial hurdles was integrating Node-RED with MQTT for communication
with Home Assistant. The discovery feature in MQTT is powerful but wasn't
immediately intuitive. It took some hands-on experimentation to understand how
to structure the messages and topics properly.

* Designing the Panel

After weeks reading about the components used in industrial automation panels,
I started by experimenting with a 2×2-foot sheet of plywood from a local
big-box store. Mounting DIN rails onto the plywood allowed me to get a rough
idea of how the components would fit together inside an enclosure. This
hands-on approach helped me visualize the layout and make adjustments before
committing to a final design.

I've done my best to align to UL-508A standards, which govern the design and
implementation of industrial control panels. I'm quite sure there are things
that I've missed, but it's been very helpful to be able to lean on well
documented specifications.


* Transitioning Systems

I was initially apprehensive about taking the old system offline and installing
the new one. The fear of causing downtime for the pool pump was a real concern.
However, by carefully planning and focusing on maintaining critical systems, I
was able to make the switch without any major issues.



## Results

Right now, I can control the pool system via Home Assistant from any device on
my home network. This includes smartphones, tablets, and computers. I'll also
be setting up some simple scene controllers that should make it easy to operate
without requiring a device on the network. Zooz makes some great z-wave
devices, including scene controllers, which should fit the bill.


This project has been a fantastic learning opportunity. I've learned a great
deal about industrial automation components, how to work effectively with
Node-RED, and improved my overall understanding of IoT systems. While I'm still
very much an amateur in this space, the amount I've learned has been incredibly
rewarding.

Perhaps the most significant benefit has been the enjoyment I've derived from
this project. Combining my interests in automation and technology to solve a
real-world problem has been incredibly fulfilling.


## Future Enhancements

* Interface

  I'm working on developing a more robust dashboard within Home Assistant to
  provide a better user experience. Additionally, I plan to implement physical
  controls as a fallback in case Home Assistant is down. While wireless options
  are simpler to install, I'm leaning toward wired controls for their reliability
  and, frankly, because I enjoy the challenge.

* Reducing Cloud Dependency

  Currently, some aspects of the system depend on cloud services, such as storing
  the flows.yaml file in GitHub. I plan to make this and other configuration
  files available locally to reduce dependency on external services and isolate
  failure domains.

* Advanced Equipment Control

  One of the more ambitious plans is to switch from using relays to control the
  pump and heater to using RS-485 communication. This will allow for more precise
  control and monitoring, while freeing up a number of relays and a good amount
  of space in the enclosure. However, since the messaging specifications aren't
  published, it will require leaning on the reverse engineering that some other
  folks have done, and perhaps some direct collaboration.


## Conclusion

  It has been an incredible journey. From grappling with outdated systems and
  restrictive corporate practices to designing and implementing my own
  solution, I've learned a great deal. The challenges were numerous, but each
  one offered an opportunity to grow and learn.

  I'm looking forward to the system being feature complete, though I doubt I'll
  ever stop tweaking, and I'm and sharing it with others who might benefit from
  my experiences. Whether you're facing similar frustrations with proprietary
  systems or simply have an interest in automation, I hope this serves as a
  useful resource and source of inspiration.


## Appendix

<!-- (Here, you can include diagrams of your system architecture, panel layouts, and -->
<!-- wiring schematics to provide visual context.) Code Samples -->

<!-- (Include snippets from your configuration files or Node-RED flows that -->
<!-- highlight key aspects of your implementation.) Resources -->

### References

* Node-RED: https://nodered.org/
* Home Assistant MQTT Discovery:
  https://www.home-assistant.io/integrations/mqtt/#mqtt-discovery
* Sequent Microsystems: https://sequentmicrosystems.com/
* Gratury Junction Box: https://www.amazon.com/gp/product/B0BFPW79LS?psc=1
* UL-508A Standards: https://www.ul.com/resources/ul-508a-third-edition-summary-requirements


### Glossary

*[SPDT]: Single Pole Double Throw
<dl>
    <dt>Single Pole Double Throw (SPDT)</dt>
    <dd>
        An electrical switch that has one common terminal (pole) and can connect it to
        one of two different output terminals (throws).
    </dd>
</dl>
