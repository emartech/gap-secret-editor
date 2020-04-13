export default {
  name: 'app',
  template: require('./app.html'),
  methods: {
    sayHello(name) {
      return `Hello ${name}!`;
    }
  }
};
