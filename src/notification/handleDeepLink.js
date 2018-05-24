
export default class HandleDeepLink {
    constructor(parts, navigator, roles) {
        this.parts = parts;
        this.navigator = navigator;
        this.roles = roles;
    }

    navigate() {
        const { parts, navigator } = this;

        navigator.popToRoot();
        navigator.dismissAllModals();
        if (parts[0] === 'home') {
            navigator.push({
                screen: 'example.Types.Push',
                title: 'Home',
              });
        }
        if(parts[0] === 'mome')
        {
            navigator.push({
                screen: 'example.Types.Push',
                title: 'Mome',
              });
        }
    }
}
