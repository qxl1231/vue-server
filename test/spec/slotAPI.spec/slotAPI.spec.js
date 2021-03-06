var wrapComponent = require('./../wrapComponent.js');
var tools = require('./../tools.js');
var $;
var contentComponent = {

    template: tools.getTpl(__dirname + '/slotAPI.spec.html', true),
    data: function () {
        return {
            value: 'dynval',
            yes: true,
            no: false
        };
    },

    components: {
        itemOne: {
            template: tools.getTpl(__dirname + '/item-one.html', true)
        },
        itemTwo: {
            template: tools.getTpl(__dirname + '/item-two.html', true)
        },
        itemMulti: {
            template: tools.getTpl(__dirname + '/item-multi.html', true)
        },
        itemDeep: {
            template: tools.getTpl(__dirname + '/item-deep.html', true)
        },
        itemVFor: {
            template: tools.getTpl(__dirname + '/item-v-for.html', true)
        },
        itemComplex: {
            template: '<i><item2 v-for="n in 1">333</item2></i>',
            components: {
                item2: {
                    template: '<b>111<slot>222</slot></b>'
                }
            }
        },
        item: {
            template: '<i>{{value}}|{{own}}</i>',
            props: ['value'],
            data: function () {
                return {
                    own: 123
                };
            }
        }
    },

    partials: {
        part: '<i>partial</i>',
        noTrim: tools.getTpl(__dirname + '/no-trim.html')
    }
};

beforeAll(function (done) {
    wrapComponent(contentComponent, function (response) {
        $ = response;
        done();
    }, {replace: true});
});

describe('<slot> API', function () {
    it('should show default slot value if no content provided', function () {
        expect($('#default').html()).toEqual(
            '<div><h1>original</h1>default slot content</div>'
        );
    });

    it('should show default slot value if spaces or line endings provided', function () {
        expect($('#default-spaces').html()).toEqual(
            '<div><h1>original</h1>default slot content</div>'
        );
    });

    it('should show proper slot values if there are spaces or line endings', function () {
        expect($('#default-hybrid-spaces').html()).toEqual(
            '<div><p slot="one">content</p>defaulttwo-default</div>'
        );
    });

    it('should render example 1', function () {
        expect($('#one').html()).toEqual(
            '<div><h1>original</h1><p>content1</p><p>content2</p></div>'
        );
    });

    it('should render example 2', function () {
        expect($('#two').html()).toEqual(
            '<div><p slot="one">One</p><p>Default A</p><p slot="two">Two</p></div>'
        );
    });

    it('should render content\'s expressions from parent\'s VM', function () {
        expect($('#express').html()).toEqual(
            '<div><h1>original</h1><p>dynval</p></div>'
        );
    });

    it('should render content\'s props from parent\'s VM', function () {
        expect($('#props').html()).toEqual(
            '<div><h1>original</h1><p title="dynval"></p></div>'
        );
    });

    // it('should not render default slot content if provided content didnt appear bacause of v-if', function () {
    //     expect($('#v-if-empty').html()).toEqual(
    //         '<div><h1>original</h1></div>'
    //     );
    // });

    it('should render properly with elements with v-if', function () {
        expect($('#v-if-hybrid').html()).toEqual(
            '<div><h1>original</h1><p>content1</p></div>'
        );
    });

    it('should render another component inside', function () {
        expect($('#with-component').html()).toEqual(
            '<div><h1>original</h1><i>dynval|123</i></div>'
        );
    });

    it('should be able to use partials as slot item', function () {
        expect($('#partial').html()).toEqual(
            '<div><p slot="one">content</p>default<i>partial</i></div>'
        );
        expect($('#partial2').html()).toEqual(
            '<b></b><b></b><div><p slot="one">content</p>default<i>partial</i></div>'
        );
    });

    it('should be able insert content into several copies of slot', function () {
        expect($('#multi').html()).toEqual(
            '<div>content-<p slot="one">content</p>-content-<p slot="one">content</p></div>'
        );
    });

    it('should be able insert content into deep down slots', function () {
        expect($('#deep').html()).toEqual(
            '<div><i>content</i> <i><p slot="one">content</p></i></div>'
        );
    });

    it('should be able insert content into several copies of slot crated via v-for', function () {
        expect($('#v-for').html()).toEqual(
            '<div><p slot="one">content</p><i><p slot="two">content</p></i></div>'
        );
    });

    it('should be able insert component inside itself', function () {
        expect($('#item-inside-item').html()).toEqual(
            '<div><h1>original</h1>222<div><h1>original</h1>OK</div></div>'
        );
    });

    it('in complex example should work properly', function () {
        expect($('#item-complex').html()).toEqual(
            '<i><b>111333</b></i>'
        );
    });
});
