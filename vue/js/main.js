let eventBus = new Vue()


Vue.component('table-cards', {
    template: `
    <div class="notes-table">
        <div class="notes-table-container column1" :class="{locked: firstColumnLocked}">
            <h2>{{columnsNotes[0].title}} ({{columnsNotes[0].notes.length}}/3)</h2>
            <div>
                <li v-for="(note, index) in columnsNotes[0].notes" :key="index">
                    <note-card :noteDetail="note" :columnIndex="0" :isLocked="firstColumnLocked" @move-to-column="handleMoveToColumn" @percentage-changed="checkFirstColumnLock"></note-card>
                </li>
            </div>
        </div>
        <div class="notes-table-container column2">
            <h2>{{columnsNotes[1].title}} ({{columnsNotes[1].notes.length}}/5)</h2>
            <div>
                <li v-for="(note, index) in columnsNotes[1].notes" :key="index">
                    <note-card :noteDetail="note" :columnIndex="1" @move-to-column="handleMoveToColumn"></note-card>
                </li>
            </div>
        </div>
        <div class="notes-table-container column3">
            <h2>{{columnsNotes[2].title}} ({{columnsNotes[2].notes.length}})</h2>
            <div>
                <li v-for="(note, index) in columnsNotes[2].notes" :key="index">
                    <note-card :noteDetail="note" :columnIndex="2"></note-card>
                </li>
            </div>
        </div>
    </div>
    `,
    data() {
        return {
            columnsNotes: [
                {title: 'Column 1', notes: []},
                {title: 'Column 2', notes: []},
                {title: 'Column 3', notes: []}
            ],
            firstColumnLocked: false,
        }
    },
    created(){
        const savedData = localStorage.getItem('tableNotesState')
        if(savedData){
            const parsed = JSON.parse(savedData)
            this.columnsNotes = parsed.columnsNotes || this.columnsNotes
            this.firstColumnLocked = parsed.firstColumnLocked || false
        }
        eventBus.$on('note-added', finalNote => {
            if(this.columnsNotes[0].notes.length < 3){
                this.columnsNotes[0].notes.push(finalNote)
                console.log('Добавлена заметка в главную таблицу')
                console.log(finalNote)
            } else{
                console.log('Нельзя добавить заметку - лимит первого столбца достигнут')
            }
        })
    },
    watch: {
        columnsNotes: {
            handler(){
                this.saveState()
            },
            deep: true
        },
        firstColumnLocked(){
            this.saveState()
        }
    },
    // mounted() {
    //     eventBus.$on('note-added', finalNote => {
    //         if(this.columnsNotes[0].notes.length < 3){
    //             this.columnsNotes[0].notes.push(finalNote)
    //             console.log('Добавлена заметка в главную таблицу')
    //             console.log(finalNote)
    //         } else{
    //             console.log('Нельзя добавить заметку - лимит первого столбца достигнут')
    //         }
    //     })
    // },
    methods:{
        saveState(){
            const state = {
                columnsNotes: this.columnsNotes,
                firstColumnLocked: this.firstColumnLocked
            }
            localStorage.setItem('tableNotesState', JSON.stringify(state))
        },
        handleMoveToColumn(note, nextColumnIndex){
            const maxNotes = [3, 5, Infinity]
            if(nextColumnIndex < maxNotes.length && this.columnsNotes[nextColumnIndex].notes.length >= maxNotes[nextColumnIndex]){
                console.log(`Нельяз переместить заметку в столбец ${nextColumnIndex +1} потому что лимит достигнут`)
                return
            }
            const currentColumnIndex = this.columnsNotes.findIndex(col => col.notes.includes(note))
            if(currentColumnIndex === -1 || currentColumnIndex === nextColumnIndex) return
            this.columnsNotes[currentColumnIndex].notes.splice(this.columnsNotes[currentColumnIndex].notes.indexOf(note), 1)
            this.columnsNotes[nextColumnIndex].notes.push(note)
            if(currentColumnIndex === 1 && nextColumnIndex === 2){
                this.checkUnlockFirstColumn()
            }
        },
        checkFirstColumnLock(){
            if(this.columnsNotes[1].notes.length >= 5 && !this.firstColumnLocked){
                const shouldLock = this.columnsNotes[0].notes.some(note => {
                    const items = ['item1', 'item2', 'item3', 'item4', 'item5']
                    let total = 0
                    let completed = 0
                    items.forEach(itemKey => {
                        if(note[itemKey] !== undefined && note[itemKey] !== null){
                            total++
                            const checkedKey = `${itemKey}Checked`
                            if(note[checkedKey]){
                                completed++
                            }
                        }
                    })
                    const percentage = total ? Math.round((completed / total) * 100) : 0
                    return percentage > 50
                })
                if(shouldLock){
                    this.firstColumnLocked = true
                }
            }
        },
        checkUnlockFirstColumn(){
            if(this.firstColumnLocked && this.columnsNotes[1].notes.length < 5){
                this.firstColumnLocked = false
            }
        }
    }
})

Vue.component('note-card', {
    props: {
        noteDetail:{
            type: Object,
            required: false,
        },
        columnIndex: Number,
        isLocked: Boolean,
    },
    template: `
    <div class="note">
        <ul class="note-list">
            <h3>{{noteDetail.title}}</h3>
            <li :class="{completed: noteDetail.item1Checked}">
                <input type="checkbox" :id="'note-item1-'+ _uid" v-model="noteDetail.item1Checked" :disabled="isLocked">
                <label :for="'note-item1-'+ _uid">{{noteDetail.item1}}</label>
            </li>
            <li :class="{completed: noteDetail.item2Checked}">
                <input type="checkbox" :id="'note-item2-'+ _uid" v-model="noteDetail.item2Checked" :disabled="isLocked">
                <label :for="'note-item2-'+ _uid">{{noteDetail.item2}}</label>
            </li>
            <li :class="{completed: noteDetail.item3Checked}">
                <input type="checkbox" :id="'note-item3-'+ _uid" v-model="noteDetail.item3Checked" :disabled="isLocked">
                <label :for="'note-item3-'+ _uid">{{noteDetail.item3}}</label>
            </li>
            <li v-if="noteDetail.item4" :class="{completed: noteDetail.item4Checked}">
                <input type="checkbox" :id="'note-item4-'+ _uid" v-model="noteDetail.item4Checked" :disabled="isLocked">
                <label :for="'note-item4-'+ _uid">{{noteDetail.item4}}</label>
            </li>
            <li v-if="noteDetail.item5" :class="{completed: noteDetail.item5Checked}">
                <input type="checkbox" :id="'note-item5-'+ _uid" v-model="noteDetail.item5Checked" :disabled="isLocked">
                <label :for="'note-item5-'+ _uid">{{noteDetail.item5}}</label>
            </li>
            <p class="progress-text">Completed: {{completionPercentage}}% </p>
            <p v-if="noteDetail.completedAt" class="completed-at">Completed at: {{formatDate(noteDetail.completedAt)}} </p>
        </ul>
    </div>
    `,
    data() {
        return {
            title: null,
            notes: []
        }
    },
    computed: {
        completionPercentage(){
            const items = ['item1', 'item2', 'item3', 'item4', 'item5',]
            let total = 0
            let completed = 0
            items.forEach(itemKey => {
                if(this.noteDetail[itemKey] !== undefined && this.noteDetail !== null && this.noteDetail[itemKey] !== null){
                    total++
                    const checkedKey = `${itemKey}Checked`
                    if(this.noteDetail[checkedKey]){
                        completed++
                    }
                }
            })
            if(total === 0) return 0
            return Math.round((completed / total) * 100)
        }
    },
    watch: {
        completionPercentage(newVal){
            this.$emit('percentage-changed')
            if(this.columnIndex === 0){
                if(newVal > 50){
                    this.$emit('move-to-column', this.noteDetail, 1)
                }
            } else if(this.columnIndex === 1){
                if(newVal >= 100){
                    this.noteDetail.completedAt = new Date()
                    this.$emit('move-to-column', this.noteDetail, 2)
                }
            }
        }
    },
    methods:{
        formatDate(date){
            return date.toLocaleString()
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