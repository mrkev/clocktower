Clocktower
==========

**Strictly beta software. Don't use as your main planning shenaningan becasue backwards compatibility between versions is not guaranteed.** 

*Currently only the latest versions of Firefox, Chrome and Safari have been tested and are supported.* Opera hasn't been tested. IE suprisingly doesn't work, and won't be officially supported for a while. If you want to work on IE support, I'll accept your PRs with `#respect`.

Trackpad with some good horizontal scrolling highly recommended.

## Getting Started

Make sure you have [Node.js](http://nodejs.org) installed.

Then clone.

    git clone git@github.com:mrkev/clocktower.git && cd clocktower

Install dependencies.

    npm install

Run.

    node index

Clocktower will fetch all course information from [RedAPI](http://api-mrkev.rhcloud.com/redapi/), process it and then start the server.

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