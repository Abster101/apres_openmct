/**
 * This plugin allows the USer to login with a username and password before entering the APRES system
 * @returns {(function(*): void)|*}
 */
export default function () {
    return function install (openmct) {

<<<<<<< HEAD
        let typeDef = {
            name: 'Login Page',
            cssClass: 'icon-plus',
            creatable: true,
            initialize: function (domainObject) {
                domainObject.configuration = configuration;
            },
            form: [
                {
                    name: "Login",
                    control: "textfield",
                    cssClass: "l-input-sm l-numeric",
                    required: true,
                    property: [
                        "configuration",
                    ]
                },
                {
                    name: "Password",
                    control: "textfield",
                    cssClass: "l-input-sm l-numeric",
                    required: true,
                    property: [
                        "configuration",
                    ]
                }
            ]
        };

        openmct.types.addType(activityKey, typeDef);
=======
                let typeDef = {
                    name: 'Login Page',
                    cssClass: 'icon-plus',
                    creatable: true,
                    initialize: function (domainObject) {
                        domainObject.configuration = configuration;
                    },
                    form: [
                        {
                            name: "Login",
                            control: "textfield",
                            cssClass: "l-input-sm l-numeric",
                            required: true,
                            property: [
                                "configuration",
                            ]
                        },
                        {
                            name: "Password",
                            control: "textfield",
                            cssClass: "l-input-sm l-numeric",
                            required: true,
                            property: [
                                "configuration",
                            ]
                        }
                    ]
                };

                openmct.types.addType(activityKey, typeDef);
>>>>>>> 267327c534f02a19378004f48af6ced1c021fd60
    }
}
