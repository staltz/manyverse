// import LoginPage from '../pageobjects/login.page';
// import SecurePage from '../pageobjects/secure.page';

describe('My Login application', () => {
  it('should login with valid credentials', async () => {
    // await LoginPage.open();

    console.log('HERE I AM');
    // await LoginPage.login('tomsmith', 'SuperSecretPassword!');
    await expect($('.css-1dbjc4n')).toBeExisting();
    // await expect(SecurePage.flashAlert).toHaveTextContaining(
    //   'You logged into a secure area!',
    // );
  });
});
