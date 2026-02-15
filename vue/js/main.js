let eventBus = new Vue()


Vue.component('table-cards', {
    template: `
    <div>
        <div class="add-note-container">
            <add-note :havePriorityNote="havePriorityNote"></add-note>
        </div>
        <div class="notes-table">
            
            <notification-popka :show="showNotification" :message="notificationMessage" :imageUrl="notificationImage" @close="hideNotification"></notification-popka>
            <div class="notes-table-container column1" :class="{locked: firstColumnLocked}">
                <h2>{{filterNotesByPriority[0].title}} ({{filterNotesByPriority[0].notes.length}}/3)</h2>
                <div>
                    <li v-for="(note, index) in filterNotesByPriority[0].notes" :key="index">
                        <note-card :havePriorityNote="havePriorityNote" :index="index" :noteDetail="note" :columnIndex="0" :isLockedWhenSecondColumnFull="firstColumnLocked" @move-to-column="handleMoveToColumn" @percentage-changed="checkFirstColumnLock"></note-card>
                    </li>
                </div>
            </div>
            <div class="notes-table-container column2">
                <h2>{{filterNotesByPriority[1].title}} ({{filterNotesByPriority[1].notes.length}}/5)</h2>
                <div>
                    <li v-for="(note, index) in filterNotesByPriority[1].notes" :key="index">
                        <note-card :havePriorityNote="havePriorityNote" :index="index" :noteDetail="note" :columnIndex="1" @move-to-column="handleMoveToColumn"></note-card>
                    </li>
                </div>
            </div>
            <div class="notes-table-container column3">
                <h2>{{filterNotesByPriority[2].title}} ({{filterNotesByPriority[2].notes.length}})</h2>
                <div>
                    <li v-for="(note, index) in filterNotesByPriority[2].notes" :key="index">
                        <note-card :havePriorityNote="havePriorityNote" :noteDetail="note" :columnIndex="2" :isDisabled="true" ></note-card>
                    </li>
                </div>
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
            havePriorityNote: false,
            firstColumnLocked: false,
            showNotification: false,
            notificationMessage: '',
            notificationImage: 'src/imgs/warn1_image.png'
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
                this.showNotificationMessage('Нельзя добавить заметку - лимит достигнут')
            }
        })
        eventBus.$on('show-notification', (message) =>{
            this.showNotificationMessage(message, 'src/imgs/warn3_image.png')
        })
        eventBus.$on('someNoteBecomePriority', (noteDetail) =>{
            console.log('Это правда, какая-то заметка стала приоритетной', noteDetail)
            this.havePriorityNote = true
        })
        eventBus.$on('someNoteLostPriority', (noteDetail) =>{
            console.log('Это правда, какая-то заметка перестала быть приоритетной', noteDetail)
            this.havePriorityNote = false
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
    computed: {
        filterNotesByPriority(){
            const sortedColumns = this.columnsNotes.map(column => {
                const sortedNotes = [...column.notes].sort((a, b)=>{
                    if(a.priority === undefined) return 1
                    if(b.priority === undefined) return -1  
                    return a.priority - b.priority
                })
                return {
                    ...column,
                    notes: sortedNotes
                }
            })
            return sortedColumns
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
        showNotificationMessage(message, url){
            if(url) this.notificationImage = url
            this.notificationMessage = message
            this.showNotification = true
        },
        hideNotification(){
            this.showNotification = false
        },
        handleMoveToColumn(note, nextColumnIndex){
            const maxNotes = [3, 5, Infinity]
            if(nextColumnIndex < maxNotes.length && this.columnsNotes[nextColumnIndex].notes.length >= maxNotes[nextColumnIndex]){
                this.showNotificationMessage(`Нельяз переместить заметку в столбец ${nextColumnIndex +1} потому что лимит достигнут`, 'src/imgs/warn2_image.png')
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
        index: String,
        columnIndex: Number,
        isLockedWhenSecondColumnFull: Boolean,
        isDisabled: Boolean,
        havePriorityNote: Boolean,

    },
    template: `
    <div class="note" :class="{lockedBecauseHavePriority: havePriorityNote && !this.noteDetail.isPriorityNote}">
        <ul class="note-list">
            <h3>{{noteDetail.title}}</h3>
            <div class="priority-container">
                <p>Priority: <strong>{{noteDetail.priority}}</strong> </p>
                <button type="button" v-if="columnIndex !== 2" v-on:click="makeNotePriority"><img src="src/svg/star_priority_button.svg" alt="Иконка" width="50" height="50"> Сделать приоритетом</button>
            </div>
            <li :class="{completed: noteDetail.item1Checked}">
                <input type="checkbox" :id="'note-item1-'+ _uid" v-model="noteDetail.item1Checked" :disabled="isLockedWhenSecondColumnFull" :disabled="isDisabled">
                <label :for="'note-item1-'+ _uid">{{noteDetail.item1}}</label>
            </li>
            <li :class="{completed: noteDetail.item2Checked}">
                <input type="checkbox" :id="'note-item2-'+ _uid" v-model="noteDetail.item2Checked" :disabled="isLockedWhenSecondColumnFull" :disabled="isDisabled">
                <label :for="'note-item2-'+ _uid">{{noteDetail.item2}}</label>
            </li>
            <li :class="{completed: noteDetail.item3Checked}">
                <input type="checkbox" :id="'note-item3-'+ _uid" v-model="noteDetail.item3Checked" :disabled="isLockedWhenSecondColumnFull" :disabled="isDisabled">
                <label :for="'note-item3-'+ _uid">{{noteDetail.item3}}</label>
            </li>
            <li v-if="noteDetail.item4" :class="{completed: noteDetail.item4Checked}">
                <input type="checkbox" :id="'note-item4-'+ _uid" v-model="noteDetail.item4Checked" :disabled="isLockedWhenSecondColumnFull" :disabled="isDisabled">
                <label :for="'note-item4-'+ _uid">{{noteDetail.item4}}</label>
            </li>
            <li v-if="noteDetail.item5" :class="{completed: noteDetail.item5Checked}">
                <input type="checkbox" :id="'note-item5-'+ _uid" v-model="noteDetail.item5Checked" :disabled="isLockedWhenSecondColumnFull" :disabled="isDisabled">
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
            if(newVal >= 100){
                this.noteDetail.isPriorityNote = false
                this.noteDetail.id = this.index
                eventBus.$emit('someNoteLostPriority', this.noteDetail)
            }
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
        },
    },
    methods:{
        formatDate(date){
            return date.toLocaleString()
        },
        makeNotePriority(){
            this.noteDetail.isPriorityNote = true
            this.noteDetail.id = this.index
            console.log('заметка теперь приоритетная')
            eventBus.$emit('someNoteBecomePriority', this.noteDetail)
            
        }
    }

})


Vue.component('add-note', {
    props:{
        havePriorityNote: Boolean,
    },
    template: `
    <div class="notes-adding">
            <form @submit.prevent="onSubmit">
                
                
                <h2>Add note</h2>
                
                <label for="title">Title</label>
                <input type="text" id="title" placeholder="title" :disabled="havePriorityNote" v-model="title" :class="{inputNotFilled: isTitleNotFilled}">
                <br>
                <label for="priority">Priority</label>
                <input type="radio" name="priority" value="1" v-model="priority" :disabled="havePriorityNote">1
                <input type="radio" name="priority" value="2" v-model="priority" :disabled="havePriorityNote">2
                <input type="radio" name="priority" value="3" v-model="priority" checked :disabled="havePriorityNote">3

                <ul class="notes-adding-list">
                    <li>
                        <label for="item1">1</label>
                        <input type="text" id="item1" :disabled="havePriorityNote" v-model="item1" :class="{inputNotFilled: isItem1NotFilled}">
                    </li>
                    <li>
                        <label for="item2">2</label>
                        <input type="text" id="item2" :disabled="havePriorityNote" v-model="item2" :class="{inputNotFilled: isItem2NotFilled}">
                    </li>
                    <li>
                        <label for="item3">3</label>
                        <input type="text" id="item3" :disabled="havePriorityNote" v-model="item3" :class="{inputNotFilled: isItem3NotFilled}">
                    </li>
                    <li v-if="item1 && item2 && item3">
                        <label for="item4">4</label>
                        <input type="text" id="item4" :disabled="havePriorityNote" v-model="item4">
                    </li>
                    <li v-if="item1 && item2 && item3 && item4">
                        <label for="item5">5</label>
                        <input type="text" id="item5" :disabled="havePriorityNote" v-model="item5">
                    </li>
                    
                </ul>
                <input type="submit" value="Submit">
                
                
            </form>
        </div>
    `,
    data() {
        return {
            id: null,
            title: null,
            priority: null,
            isPriorityNote: false,
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

            isTitleNotFilled: false,
            isItem1NotFilled: false,
            isItem2NotFilled: false,
            isItem3NotFilled: false,
        }
    },
    methods: {
        onSubmit() {
            this.isTitleNotFilled = false;
            this.isItem1NotFilled = false;
            this.isItem2NotFilled = false;
            this.isItem3NotFilled = false;

            if(!this.title || !this.item1 || !this.item2 || !this.item3){
                if(!this.title){
                    this.isTitleNotFilled = true
                }
                if(!this.item1){
                    this.isItem1NotFilled = true
                }
                if(!this.item2){
                    this.isItem2NotFilled = true
                }
                if(!this.item3){
                    this.isItem3NotFilled = true
                }
                eventBus.$emit('show-notification', 'Не все обязательные поля заполнены')
                return
            }
            if (this.title && this.item1 && this.item2 && this.item3) {
                let finalNote = {
                    title: this.title,
                    priority: this.priority,
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
                this.priority = "3"
                this.item1 = null
                this.item2 = null
                this.item3 = null
                this.item4 = null
                this.item5 = null
            }
        }
    },
})

Vue.component('notification-popka', {
    props: {
        show: Boolean,
        message: String,
        imageUrl: String
    },
    template: `
    <div class="notification-container" v-show="show">
        <div class="notification-content">
            <img :src="imageUrl" alt="Notification Image" class="notification-image">
            <p class="notification-message">{{ message }}</p>
        </div>
    </div>
    `,
    watch: {
        show(newVal){
            if(newVal){
                setTimeout(() => {
                    this.$emit('close')
                }, 3000)
            }
        }
    }
})


let app = new Vue({
    el: '#app',
})