let eventBus = new Vue()


Vue.component('table-cards', {
    template: `
    <div class="notes-table">
                <div class="notes-table-container column1">
                <h2>{{columnsNotes[0].title}}</h2>
                    <div>
                        <li v-for="note in columnsNotes[0].notes">
                            <note-card :noteDetail="note"></note-card>
                        </li>
                    </div>
                </div>
                <div class="notes-table-container column2">
                <h2>{{columnsNotes[1].title}}</h2>
                </div>
                <div class="notes-table-container column3">
                <h2>{{columnsNotes[2].title}}</h2>
                </div>
            </div>
    `,
    data() {
        return {
            columnsNotes: [
                {
                    title: 'Column 1',
                    notes: []
                },
                {
                    title: 'Column 2',
                    notes: []
                },
                {
                    title: 'Column 3',
                    notes: []
                }
            ]
        }
    },
    mounted() {
        eventBus.$on('note-added', finalNote => {
            this.columnsNotes[0].notes.push(finalNote)
            console.log('Добавлена заметка в главную таблицу')
            console.log(finalNote)
        })
    },
})

Vue.component('note-card', {
    props: {
        noteDetail:{
            type: Object,
            required: false,
        }
    },
    template: `
    <div class="note">
        <ul class="note-list">
            <h3>{{noteDetail.title}}</h3>
            <li :class="{completed: noteDetail.item1Checked}">
                <input type="checkbox" :id="note-item1" v-model="noteDetail.item1Checked">
                <label for="note-item1">{{noteDetail.item1}}</label>
            </li>
            <li :class="{completed: noteDetail.item2Checked}">
                <input type="checkbox" :id="note-item2" v-model="noteDetail.item2Checked">
                <label for="note-item2">{{noteDetail.item2}}</label>
            </li>
            <li :class="{completed: noteDetail.item3Checked}">
                <input type="checkbox" :id="note-item3" v-model="noteDetail.item3Checked">
                <label for="note-item3">{{noteDetail.item3}}</label>
            </li>
            <li v-if="noteDetail.item4" :class="{completed: noteDetail.item4Checked}">
                <input type="checkbox" :id="note-item4">
                <label for="note-item4">{{noteDetail.item4}}</label>
            </li>
            <li v-if="noteDetail.item5">
                <input type="checkbox" id="note-item5">
                <label for="note-item5">{{noteDetail.item5}}</label>
            </li>
        </ul>
    </div>
    `,
    data() {
        return {
            title: null,
            notes: [

            ]
        }
    }

})


Vue.component('add-note', {
    template: `
    <div class="notes-adding">
            <form @submit.prevent="onSubmit">
                <h2>Add note</h2>
                <label for="title">Title</label>
                <input type="text" id="title" placeholder="title" v-model="title">
                <ul class="notes-adding-list">
                    <li>
                        <label for="item1">1</label>
                        <input type="text" id="item1" v-model="item1">
                    </li>
                    <li>
                        <label for="item2">2</label>
                        <input type="text" id="item2" v-model="item2">
                    </li>
                    <li>
                        <label for="item3">3</label>
                        <input type="text" id="item3" v-model="item3">
                    </li>
                    <li>
                        <label for="item4">4</label>
                        <input type="text" id="item4" v-model="item4">
                    </li>
                    <li>
                        <label for="item5">5</label>
                        <input type="text" id="item5" v-model="item5">
                    </li>
                    
                </ul>
                <input type="submit" value="Submit">
                
            </form>
        </div>
    `,
    data() {
        return {
            title: null,
            item1: null,
            item2: null,
            item3: null,
            item4: null,
            item5: null,
            item1Checked: false,
            item2Checked: false,
            item3Checked: false,
            item4Checked: false,
            item5Checked: false,
        }
    },
    methods: {
        onSubmit() {
            if (this.title && this.item1 && this.item2 && this.item3) {
                let finalNote = {
                    title: this.title,
                    item1: this.item1,
                    item2: this.item2,
                    item3: this.item3,
                    item4: this.item4,
                    item5: this.item5,
                    item1Checked: false,
                    item2Checked: false,
                    item3Checked: false,
                    item4Checked: false,
                    item5Checked: false,
                }
                console.log('Печатаю заметку')
                console.log(finalNote)
                eventBus.$emit('note-added', finalNote)

                this.title = null
                this.item1 = null
                this.item2 = null
                this.item3 = null
                this.item4 = null
                this.item5 = null
            }
        }
    },

})


let app = new Vue({
    el: '#app',
})