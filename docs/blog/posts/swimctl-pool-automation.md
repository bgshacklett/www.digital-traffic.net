---
title: >-
    Building an Open Pool Automation Platform
date: 2024-11-29
---

When I became a new pool owner, I was quickly frustrated by the cost and lack
of availability of parts for my aging pool automation system. After a good bit
of research into how everything worked, I decided to do something about it.

Now that it's feature complete, I wanted to show the result, including:

* Hardware implementation
* Software implementation with links to Node-RED flows and Kubernetes manifests
* Integration with Home Assistant

<!-- more -->

## Goals

* Use Off-the-Shelf Parts

  The whole journey started because of the badly behaved companies who have a
  stranglehold on the pool supply market, so the most important requirement was
  to build the entire system using readily available components. I wanted to
  ensure that any part of the system could be easily replaced without jumping
  through hoops or dealing with proprietary restrictions. This makes
  maintenance straightforward and encourages future experimentation and
  improvements.

* Feature Parity with the Old System

  The original automation system had the following features that I needed to
  implement:

    * Control the pool and spa lights
    * Handle switching from pool mode to spa mode by triggering valve actuators
    * Enable the heater to be turned on remotely
    * Ensure that the pump is running during spa operation
    * Run the blower when the spa is on

* Control the New Pump

  In addition to the original features, I wanted the new system to control the
  speed of the variable speed pump I'd purchased to replace the old rusty
  single-speed pump that came with the house. Most importantly, ramping the
  speed up when in spa mode, but also avoiding the need to reset the time on
  the pump's drive unit every time the power was interrupted.

* Multi-Mode Control of the Heater

  While the old system was capable of turning the heater on and off, it wasn't
  able to select between pool and spa temperatures. The new system will use a
  so-called 3-wire control (and eventually RS-485 if I can get it working) to
  enable choosing from one of two preset temperatures depending on use. 


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

  Looking down the road, the one-to-one compatibility with Pi compute modules
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
  many different solutions and eventually stumbled upon Sequent Microsystems'
  [Eight Relays 4A/120V 8-Layer Stackable
  HAT](https://sequentmicrosystems.com/products/8-relays-stackable-card-for-raspberry-pi).
  Up to eight of these can be stacked onto a single Pi, and using two of them
  gave me a total of 16 SPDT relays and a bonus RS-485/MODBUS port. They
  integrate seamlessly with the Raspberry Pi, via I²C which leaves all of the
  GPIO pins open, and they have pre-built nodes for Node-Red, plus among a
  number of other integrations. All told, they've proved an efficient choice
  for managing multiple devices with very little effort.

* External Relays and other 24VAC components

  The pool and spa lights run too close to the 4 amp rating of the relays on
  the Sequent Microsystems board, so I added some extra Schneider Electric
  relays to control them. Similarly, the blower runs on 240v with a rating of
  1.5HP, so I added a large 2HP rated DPST relay to operate it.

  The actuators for the valves run on 24VAC, requiring that I add a transformer
  to the mix, so I chose to use this voltage to power the relay coils. 24VAC is
  pretty ubiquitous in the industrial automation space, so having this
  available helped with sourcing parts.

  <!-- TODO: wording; add link to transformer -->
  Finding the right transformer for these components was a bit of a challenge.
  It took me some time to choose one. I landed on the [TR100VA001 100Va, 120 to
  24 VAC transformer from Functional
  Devices](https://www.amazon.com/gp/product/B007IAVJ64/ref=ppx_yo_dt_b_search_asin_title?ie=UTF8&psc=1).
  I'm still not entirely sure I made the best choice, but it works for now. I
  think I might eventually be able to switch it out for a smaller unit without
  losing any functionality, but more math is required.

* Enclosure

  For the enclosure, I opted for an [IP67 Plastic Enclosure from
  Gratury](https://www.amazon.com/gp/product/B0BFPW79LS/ref=ppx_yo_dt_b_search_asin_title?ie=UTF8&psc=1)
  purchased on Amazon. This enclosure features a removable backplate with a
  grid of pre-formed holes, making it easy to mount components securely. The
  IP67 rating, plus some waterproof cable glands ensure that the system is
  well-protected from the elements. I opted for the 20″ × 16.1″ × 7.9″ box,
  which fit quite nicely in the space left by the old system.


* Circuit Protection

  The automation system functions, partially, as a load center for the
  pool equipment, so each major section of the panel has dedicated circuit
  breakers. This not only allows for the use of smaller gauge (less expensive
  and more flexible) wire but also enables isolation for troubleshooting
  purposes. By being able to cut power to specific sections, I can work on the
  system more safely and efficiently.


## Software Architecture

Node-RED provides the core software implementation; it handles all events,
logic, and interfacing with Home Assistant. I chose Node-RED because of its
strong community support and widespread use in similar automation solutions. It
provided the flexibility and functionality I needed without a steep learning
curve. I did consider using OpenPLC, but 

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


## Implementation

* Designing the Panel

  After weeks of reading about the components used in industrial automation
  panels, I started by experimenting with a 2×2-foot sheet of plywood from a
  local big-box store. Mounting DIN rails onto the plywood allowed me to get a
  rough idea of how the components would fit together inside an enclosure. This
  hands-on approach helped me visualize the layout and make adjustments before
  committing to a final design.

  <!-- ![prototyping the panel on plywood](images/) -->

  I've put some effort in to align to UL-508A standards, which govern the design and
  implementation of industrial control panels. Realistically, though, I'm quite
  sure there are things that I've missed. Still, it's been very helpful to be able
  to lean on well documented specifications.


* A Code-First Methodology

  I'm working hard to ensure that as much of the configuration as possible is
  stored in a Git repository and deployed via automation tools. This means I
  can rebuild the entire system quickly because the build process is almost
  entirely automated. A code-first approach also serves as excellent
  documentation, providing a clear record of how everything fits together.
  Hopefully this translates to serving as a solid resource to others facing
  similar problems.


* Transitioning Systems

  I was initially apprehensive about taking the old system offline and
  installing the new one. Causing extended downtime for the pool pump was a
  real concern; nobody wants a green pool. Prior to pulling down the old panel,
  I made sure that power to the pump would be quick and easy to restore in the
  new panel, even if nothing else worked. As a result, the pump was only
  offline for a few hours while I swapped the panels out (and cleaned up the
  caulk that some well-meaning person used to hide the seams between the old
  box and the wall).

  With the pump up and running quickly after the new box was mounted, I was
  able to take time to get everything else back up and running without feeling
  like I was under the gun. This approach allowed me to focus on implementing
  and testing each component thoroughly. It effectively descoped almost
  everything from the absolute minimum viable product, allowing for quick
  iteration and addition of additional features to get to the desired outcome.


* First Experiences with Node-Red

  Programming in Node-RED required a different way of thinking from e.g.:
  Python, or Java, and integrating with Home Assistant required a lot of
  reading and looking at what other people have done. Overall, though, it's
  been a fantastic experience, and I'm pleased with how it's come together.
  I've been a fan of event-driven architectures for a long time, and it's been
  great to really dive into that world. I imagine what I've learned here will
  help me think about the code I write on a daily basis in a new light.

  At the moment, it's feature complete, and I'm able to control everything I
  set out to in the original project goals. The biggest thing I've noticed with
  Node-Red versus other programming languages is the level of certainty that I
  have at any given point in the flow. I feel like I've got a lot more control
  over what messages are passing through the system, and theres far less effort
  required dealing with unknowns.


* Integrating Node-RED with MQTT

  This was a bit challenging to understand, at first. The MQTT discovery
  specification is quite well documented, but I had difficulty finding any
  guidance on implementation via Node-Red. It took a good deal of experimenting
  to understand how to provide and collect metadata for each component, how to
  structure the messages and topics properly, and how and when to trigger the
  discovery messages.

  Eventually, I came up with this flow which initiates the metadata collection
  and sends the appropriate message to the MQTT config topic:

  ```noderedjson with-linklines with-download-link
  [
      {
          "id": "03928a46de37cade",
          "type": "tab",
          "label": "MQTT Discovery",
          "disabled": false,
          "info": "",
          "env": []
      },
      {
          "id": "ce2ae99a0f8d9c93",
          "type": "mqtt out",
          "z": "03928a46de37cade",
          "name": "Home Assistant MQTT Discovery",
          "topic": "homeassistant/device/swimctl-controller-01/config",
          "qos": "2",
          "retain": "false",
          "respTopic": "",
          "contentType": "application/json",
          "userProps": "",
          "correl": "",
          "expiry": "",
          "broker": "3fbc57f2c63e2a25",
          "x": 800,
          "y": 420,
          "wires": []
      },
      {
          "id": "central_metadata_input",
          "type": "link in",
          "z": "03928a46de37cade",
          "name": "Metadata Input",
          "links": [
              "8477439e60fc5c07",
              "2197c0ec581e0457",
              "aa83f5464328da17",
              "ecf9ce2c588f0c8f",
              "81925d77aaee4a08",
              "1a54f5bf9b5b7ddc",
              "f9428519a776ea91",
              "63632c887cc6a11c",
              "da428207d3c07107",
              "5200deef5d5b28c9",
              "1341090827c116ed",
              "cea254f729d34a0c",
              "3165b7d0ce0ea93e",
              "631d5762c053ac56"
          ],
          "x": 115,
          "y": 420,
          "wires": [
              [
                  "6f288140b05f4938",
                  "04cc717d69835bf1"
              ]
          ]
      },
      {
          "id": "6f288140b05f4938",
          "type": "join",
          "z": "03928a46de37cade",
          "name": "",
          "mode": "custom",
          "build": "merged",
          "property": "payload",
          "propertyType": "msg",
          "key": "topic",
          "joiner": "\\n",
          "joinerType": "str",
          "accumulate": true,
          "timeout": "1",
          "count": "12",
          "reduceRight": false,
          "reduceExp": "",
          "reduceInit": "{}",
          "reduceInitType": "num",
          "reduceFixup": "",
          "x": 230,
          "y": 420,
          "wires": [
              [
                  "be87fe8d4b0d9575",
                  "7c5264703d680638"
              ]
          ]
      },
      {
          "id": "be87fe8d4b0d9575",
          "type": "function",
          "z": "03928a46de37cade",
          "name": "Format Discovery Message",
          "func": "return { \"payload\": {\n    \"dev\": {\n        \"ids\": \"swimctl-controller-01\",\n        \"name\": \"Pool Controller\",\n        \"mf\": \"Brian G. Shacklett\",\n        \"mdl\": \"01\",\n        \"sw\": \"0.1.0\",\n        \"sn\": \"00000001\",\n        \"hw\": \"0.1.0\"\n    },\n    \"o\": {\n        \"name\": \"swimctl\",\n        \"sw\": \"0.1.0\",\n        \"url\": \"https://github.com/bgshacklett/swimctl/issues\"\n    },\n    \"cmps\": msg.payload,\n\"state_topic\": \"swimctl/system/state\",\n    \"qos\": 2\n}};",
          "outputs": 1,
          "noerr": 0,
          "initialize": "",
          "finalize": "",
          "libs": [],
          "x": 480,
          "y": 420,
          "wires": [
              [
                  "f80e7ec7634438a6",
                  "ce2ae99a0f8d9c93"
              ]
          ]
      },
      {
          "id": "7c5264703d680638",
          "type": "debug",
          "z": "03928a46de37cade",
          "name": "Join",
          "active": false,
          "tosidebar": true,
          "console": false,
          "tostatus": false,
          "complete": "payload",
          "targetType": "msg",
          "statusVal": "",
          "statusType": "auto",
          "x": 410,
          "y": 380,
          "wires": []
      },
      {
          "id": "04cc717d69835bf1",
          "type": "debug",
          "z": "03928a46de37cade",
          "name": "Link In",
          "active": false,
          "tosidebar": true,
          "console": false,
          "tostatus": false,
          "complete": "payload",
          "targetType": "msg",
          "statusVal": "",
          "statusType": "auto",
          "x": 230,
          "y": 380,
          "wires": []
      },
      {
          "id": "f80e7ec7634438a6",
          "type": "debug",
          "z": "03928a46de37cade",
          "name": "Discovered Devices",
          "active": true,
          "tosidebar": true,
          "console": true,
          "tostatus": false,
          "complete": "payload",
          "targetType": "msg",
          "statusVal": "",
          "statusType": "auto",
          "x": 760,
          "y": 380,
          "wires": []
      },
      {
          "id": "bd894822a26f7320",
          "type": "mqtt in",
          "z": "03928a46de37cade",
          "name": "Home Assistant Status",
          "topic": "homeassistant/status",
          "qos": "2",
          "datatype": "utf8",
          "broker": "3fbc57f2c63e2a25",
          "nl": false,
          "rap": true,
          "rh": 0,
          "inputs": 0,
          "x": 200,
          "y": 160,
          "wires": [
              [
                  "6e5f91f6b8c2d5b1",
                  "1884ca75e1d54add"
              ]
          ]
      },
      {
          "id": "6e5f91f6b8c2d5b1",
          "type": "debug",
          "z": "03928a46de37cade",
          "name": "Home Assistant Status",
          "active": false,
          "tosidebar": true,
          "console": false,
          "tostatus": false,
          "complete": "payload",
          "targetType": "msg",
          "statusVal": "",
          "statusType": "auto",
          "x": 460,
          "y": 120,
          "wires": []
      },
      {
          "id": "1884ca75e1d54add",
          "type": "switch",
          "z": "03928a46de37cade",
          "name": "",
          "property": "payload",
          "propertyType": "msg",
          "rules": [
              {
                  "t": "eq",
                  "v": "online",
                  "vt": "str"
              },
              {
                  "t": "eq",
                  "v": "offline",
                  "vt": "str"
              }
          ],
          "checkall": "true",
          "repair": false,
          "outputs": 2,
          "x": 410,
          "y": 160,
          "wires": [
              [
                  "f217ef5ba3dfbcd4"
              ],
              []
          ]
      },
      {
          "id": "f217ef5ba3dfbcd4",
          "type": "link out",
          "z": "03928a46de37cade",
          "name": "Home Assistant Startup",
          "mode": "link",
          "links": [
              "d81339ab9952fb29",
              "75323951ea67af27",
              "206f4aff1ccea06b",
              "660c1d21eeed30fd",
              "4601c678b5cb434e",
              "9477f33b0ea7fdd3",
              "35eb824690bc32c0",
              "1681669572348d99",
              "abf9f0f5a5289164",
              "c877f98f67de0934",
              "84cef76c6b3a453d",
              "10f65557c2e64ce7",
              "79e522e98af395be",
              "9b105cbc5960b448"
          ],
          "x": 525,
          "y": 160,
          "wires": []
      },
      {
          "id": "86f876a33ad41dc3",
          "type": "comment",
          "z": "03928a46de37cade",
          "name": "Trigger discovery on Home Assistant Startup",
          "info": "",
          "x": 270,
          "y": 60,
          "wires": []
      },
      {
          "id": "dd0e20bb968a42e6",
          "type": "comment",
          "z": "03928a46de37cade",
          "name": "Publish Discovery Messages",
          "info": "",
          "x": 220,
          "y": 320,
          "wires": []
      },
      {
          "id": "3fbc57f2c63e2a25",
          "type": "mqtt-broker",
          "name": "Mosquitto (Home Assistant)",
          "broker": "192.168.4.74",
          "port": "1883",
          "clientid": "",
          "autoConnect": true,
          "usetls": false,
          "protocolVersion": "5",
          "keepalive": "60",
          "cleansession": true,
          "birthTopic": "swimctl/system/status",
          "birthQos": "2",
          "birthPayload": "starting",
          "birthMsg": {
              "contentType": "text/plain"
          },
          "closeTopic": "swimctl/system/status",
          "closeQos": "2",
          "closePayload": "stopping",
          "closeMsg": {
              "contentType": "text/plain"
          },
          "willTopic": "swimctl/system/status",
          "willQos": "0",
          "willPayload": "offline",
          "willMsg": {},
          "userProps": "",
          "sessionExpiry": ""
      }
  ]
  ```

  This joins multiple entity-level messages together via a function node:
  ```JavaScript
  return { "payload": {
      "dev": {
          "ids": "swimctl-controller-01",
          "name": "Pool Controller",
          "mf": "Brian G. Shacklett",
          "mdl": "01",
          "sw": "0.1.0",
          "sn": "00000001",
          "hw": "0.1.0"
      },
      "o": {
          "name": "swimctl",
          "sw": "0.1.0",
          "url": "https://github.com/bgshacklett/swimctl/issues"
      },
      "cmps": msg.payload,
  "state_topic": "swimctl/system/state",
      "qos": 2
  }};
  ```
  I'm sure there's room for improvement here, but so far it's been rock solid.
  Every time the system comes up, or Home Assistant reboots, the metadata for
  all entities, plus the device, gets collected and sent over to HA. So far, I
  haven't seen a single case where a "finished" component has displayed any
  unexpected behaviors.


## Results

Right now, I can control the pool system via Home Assistant from any device on
my home network, or any device which can reach my Home Assistant cloud
instance, provided by Nabu Casa. This includes smartphones, tablets, and
computers. I also plan to set up some simple scene controllers that should
make it easy to operate without requiring a device on the network. Zooz makes
some great z-wave devices, including scene controllers, which should fit the
bill.

This project has been a fantastic learning opportunity. I've learned a great
deal about industrial automation components, how to work effectively with
Node-RED, and improved my overall understanding of automation systems.

Most importantly, it's been a ton of fun. Combining my interests in automation
and technology to solve a real-world problem has been incredibly fulfilling.


## Future Enhancements

* Interface

  I'm working on developing a more robust dashboard within Home Assistant to
  provide a better user experience. Additionally, I plan to implement physical
  controls as a fallback in case Home Assistant is down, or someone needs to
  control the system without access to HA. While wireless options are simpler
  to install, I'm leaning toward wired controls for their reliability and,
  because it gives me an opportunity to experiment with more layer 1 and 2
  protocols. RS-485 would be useful to get some experience with, and CAN bus
  could be another great thing to learn. I'd love to start getting into some
  automotive oriented projects.

* Reducing Cloud Dependency

  Currently, some aspects of the system depend on cloud services, especially
  storing the flows.yaml file in GitHub. Once the "firmware" is nailed down a
  bit better, I'll focus on packaging up the configuration and flows to reduce
  dependency on external services and isolate failure domains.

* Advanced Equipment Control

  One of my more ambitious plans is to switch from using relays to control the
  pump and heater to using RS-485 communication. This will allow for more
  precise control and monitoring, plus freeing up a number of relays and a
  good amount of space in the enclosure. Unfortunately, the messaging
  specifications aren't published, so it will require leaning on the reverse
  engineering that some other folks have done to make it happen. The LoE is
  pretty high, here, so it'll likely be a while before something frustrates me
  enough to get me moving on this.


## Conclusion

  It has been an incredible journey. From grappling with outdated systems and
  restrictive corporate practices to designing and implementing my own
  solution, I've learned a great deal. The challenges were numerous, but each
  one offered an opportunity to grow and learn.

  I'm happy to have the system feature complete, though I doubt I'll ever stop
  tweaking, and I'm excited to share it with others who might benefit from my
  experiences. I hope this serves as a useful resource and source of
  inspiration to others who are interested in similar undertakings.


## Appendix

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
