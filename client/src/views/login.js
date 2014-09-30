// The login view

var LoginView = Backbone.Marionette.ItemView.extend({
    template: require('../../templates/login.html'),

    events: {
        'click button': 'login',
        'keyup input': 'loginEnter'
    },

    loginEnter: function(ev) {
        var self = this;
        var keyCode = ev.keyCode || ev.which;
        if (keyCode == '13'){
            self.login(ev);
        }
    },

    login: function(ev) {
        var self  = this;
        var radio = Backbone.Wreqr.radio.channel('global');
        var data = {};
        $.each(self.$el.find('form.login_form').serializeArray(), function() { data[this.name] = this.value; });
        radio.vent.trigger('login', data);
    }
});

module.exports = LoginView;