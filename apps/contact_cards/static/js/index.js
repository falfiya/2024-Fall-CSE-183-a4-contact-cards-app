"use strict";

const app = Vue.createApp({});

app.component("contacts", {
    setup() {
        // :Cults:
        const contacts = Vue.ref([]);
        async function fetchData() {
            const {data} = await axios.get(contacts_url);
            contacts.value = data;
        }
        async function addContact() {
            const {data} = await axios.post(contacts_url);
            contacts.value = [{id: data}, ...contacts.value];
        }
        async function editContact(c) {
            await axios.put(contacts_url, c);
            for (const curr of contacts.value) {
                if (curr.id === c.id) {
                    Object.assign(curr, c);
                    break;
                }
            }
        }
        async function deleteContact(id) {
            await axios.delete(`${contacts_url}?id=${id}`);
            contacts.value = contacts.value.filter(c => c.id !== id);
        }

        fetchData();

        function getImage() {
            // need to do modal
        }

        return {
            contacts,
            addContact,
            editContact,
            deleteContact,
            getImage,
        }
    },
    template: /* html */ `
        <div class="container">
            <h1 class="title">Contacts</h1>
            <div>
                <button class="button is-success" id="add_button" @click="addContact">
                    Add Contact
                </button>
            </div>
            <template v-for="c in contacts" :key="c.id">
                <contact
                    :me="c"
                    :editContact="editContact"
                    :deleteContact="deleteContact"
                    :getImage="getImage"
                />
            </template>
        </div>
    `
});

app.component("contact", {
    props: ["me", "editContact", "deleteContact", "getImage"],
    setup(props) {
        function changeName(name) {
            props.me.name = name;
            props.editContact(props.me);
        }
        function changeCompany(company) {
            props.me.company = company;
            props.editContact(props.me);
        }
        function changeImage(img) {
            props.me.img = img;
            props.editContact(props.me);
        }
        return {
            changeName,
            changeCompany,
            changeImage,
        };
    },
    template: /* html */ `
        <div class="card contact mt-4">
            <div class="card-content">
                <div class="media">
                    <div class="media-left">
                        <contact-image
                            :src="me.img"
                            :getImage="getImage"
                            :change="changeImage"
                        />
                    </div>
                    <div class="media-content">
                        <p class="title person-name">
                            <editable-text
                                clazz="input is-4 title"
                                name="name"
                                placeholder="Name"
                                :value="me.name"
                                :change="changeName"
                            />
                        </p>
                        <p class="subtitle person-affiliation">
                            <editable-text
                                clazz="input is-6"
                                name="affiliation"
                                placeholder="Affiliation"
                                :value="me.company"
                                :change="changeCompany"
                            />
                        </p>
                    </div>
                    <div class="media-right">
                        <i class="delete-button has-text-danger fa fa-trash trash" @click="deleteContact(me.id)"></i>
                    </div>
                </div>
                <textarea
                    class="textarea"
                    name="description"
                    placeholder="Description"
                ></textarea>
            </div>
        </div>
    `,
})

app.component("editable-text", {
    props: ["clazz", "name", "placeholder", "value", "change"],
    setup(props) {
        const input = Vue.ref(null);
        const readonly = Vue.ref(true);
        const style = Vue.computed(() => {
            const bake = readonly.value && props.value;
            if (bake) {
                return {
                    border: "none",
                    padding: "0px",
                };
            } else {
                return {};
            }
        });
        function activate() {
            readonly.value = false;
            input.value.focus();
        }
        function commit() {
            readonly.value = true;
            props.change(input.value.value);
        }
        return {
            input,
            readonly,
            style,
            activate,
            commit,
        };
    },
    template: /* html */ `
        <input
            ref="input"
            :class="clazz"
            :name="name"
            :placeholder="placeholder"
            :value="value"
            :readonly="readonly"
            :style="style"
            @click="activate"
            @blur="commit"
        ></input>
    `,
});

app.component("contact-image", {
    props: ["src", "getImage"],
    template: /* html */ `
        <figure class="photo image is-96x96">
            <img class="photo" :src="src || 'https://bulma.io/assets/images/placeholders/96x96.png'"/>
        </figure>
    `,
});

app.mount("#app");
