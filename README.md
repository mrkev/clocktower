Clocktower
==========

**Strictly beta software. Don't use as your main planning shenaningan becasue backwards compatibility between versions is not guaranteed.** 

*Currently only Firefox, Chrome and Safari are supported. Opera hasn't been tested. IE suprisingly doesn't work, and won't be officially supported for a while. If you want to work on IE support, I'll accept your PRs with `#respect`.*

Trackpad with some good horizontal scrolling highly recommended.

## Getting Started

First, make sure you have Node.js installed. 

Then clone.

    git clone git@github.com:mrkev/clocktower.git && cd clocktower

Install dependencies.

    npm install

Run.

    node index

Clocktower will fetch all course information from RedAPI, process it and then start the server.

### Known Bugs

    [ ] Pre-enroll has to be scrolled to after revealed
    [ ] Scrollbar display issues on Safari
    [ ] Course tooltips interfere with course dropzones

### Todo

    [ ] Custom events
    [ ] iCal support
    [ ] Good printing styles
    [ ] Support for terms other than FA14

### Would be cool but wont happen for some time

    [ ] Online accounts / online sharing 'a la chequerd'
    [ ] Tests?