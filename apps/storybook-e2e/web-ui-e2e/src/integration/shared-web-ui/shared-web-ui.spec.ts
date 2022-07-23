describe('shared-web-ui: SharedWebUi component', () => {
  beforeEach(() => cy.visit('/iframe.html?id=sharedwebui--primary'));
    
    it('should render the component', () => {
      cy.get('h1').should('contain', 'Welcome to SharedWebUi!');
    });
});
