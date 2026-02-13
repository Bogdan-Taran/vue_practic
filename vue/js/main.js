let eventBus = new Vue()

Vue.component('task-card', {
    props: {
        task: {
            type: Object,
            required: true
        },
        columnIndex: Number,
        isEditing: Boolean
    },
    template: `
        <div class="task-card" :class="{overdue: isOverdue}">
            <div v-if="!isEditing">
                <h4>{{task.title}}</h4>
                <p class="task-description">{{task.description}}</p>
                <div class="task-info">
                    <p><strong>Created:</strong> {{formatDate(task.createdAt)}}</p>
                    <p><strong>Deadline:</strong> {{formatDate(task.deadline)}}</p>
                    <p v-if="editedAt"><strong>Last edit:</strong> {{formatDate(task.editedAt)}}</p>
                    <p v-if="complitedAt"><strong>Complited:</strong> {{formatDate(task.complitedAt)}}</p>
                    <p v-if="returnReason"><strong>Return reason:</strong> {{task.returnReason}}</p>
                    <p v-if="isOverdue" class="overdue-badge">OVERDUE</p>
                    <p v-else-if="columnIndex === 3 && !isOverdue" class="ontime-badge">COMPLITED ON TIME</p>
                </div>

                <div class="card-actions">
                    <button v-if="columnIndex === 0" @click="$emit('edit')">Edit</button>
                    <button v-if="columnIndex === 1" @click="$emit('edit')">Edit</button>
                    <button v-if="columnIndex === 2" @click="$emit('edit')">Edit</button>
                    
                    <button v-if="columnIndex === 0" @click="$emit('delete')" class="btn-delete">Delete</button>
                    
                    <button v-if="columnIndex === 0" @click="$emit('move', 1)" class="btn-move">Work</button>
                    <button v-if="columnIndex === 1" @click="$emit('move', 2)" class="btn-move">Testing</button>
                    
                    <button v-if="columnIndex === 2" @click="moveToDone" class="btn-move">Done</button>
                    
                    <button v-if="columnIndex === 2" @click="returnToWork" class="btn-return">Return to work</button>
                </div>
            </div>

            <div v-else class="edit-form">
                <h4>Edit Task</h4>
                <input v-model="editedTask.title" placeholder="Title" class="edit-input">
                <textarea v-model="editedTask.description" placeholder="Description" class="edit-textarea"></textarea>
                <input type="datetime-local" v-model="editedTask.deadline" class="edit-input">
                <div class="edit-actions">
                    <button @click="saveEdit" class="btn-save">Save</button>
                    <button @click="$emit('cancel-edit')" class="btn-cancel">Cancel</button>
                </div>
            </div>
        </div>
    `,
    data(){
        return{
            editedTask:{
                ...this.task
            }
        }
    },
    computed: {
        isOverdue(){
            if(!this.task.deadline || this.columnIndex !== 3) return false
            return new Date(this.task.dedline) < new Date()
        }
    },
    methods: {
        formatDate(date){
            if(!date) return ''
            return new Date(date).toLocaleString()
        },
        saveEdit(){
            this.editedTask.editedAt = new Date().toISOString()
            this.$emit('update-task', this.editedTask)
        },
        moveToDone(){
            const updatedTask = { ...this.task, completedAt: new Date().toISOString()}
            this.$emit('move', 3, updatedTask)
        },
        returnToWork(){
            const reason = prompt('Enter reason for returning to work')
            if(reason !== null){
                const updatedTask = {...this.task, returnReason: reason}
                this.$emit('move', 1, updatedTask)
            }
        }
    }
})


Vue.component('kanban-column', {
    props: {
        title: String,
        tasks: Array,
        columnIndex: Number,
        editingTaskId: String,
    },
    template: `
    <div class="kanban-column">
        <h3>{{title}} ({{tasks.length}})</h3>
        <div class="tasks-container">
            <task-card v-for="task in tasks" :key="task.id" :task="task" :column-index="columnIndex" :idEditing="editingTaskId === task.id" @edit="$emit('start-edit', task.id)" @delete="$emit('delete-task', task.id)" @move="$emit('move-task', task.id, $event)" @update-task="$emit('update-task', $event)" @cancel-edit="$emit('cancel-edit')"/>
        </div>
    </div>
    `
})

Vue.component('kanban-board', {
    template: `
    <div class="kanban-board">
        <notification-popka :show="showNotification" :message="notificationMessage" :imageUrl="notificationImage" @close="hideNotification"></notification-popka>
        <div class="board-columns">
            <kanban-column
                v-for="(column, index) in columns"
                :key="index"
                :title="column.title"
                :tasks="column.tasks"
                :column-index="index"
                :editing-task-id="editingTaskId"
                @start-edit="startEditing"
                @delete-task="deleteTask"
                @move-task="moveTask"
                @update-task="updateTask"
                @cancel-edit="editingTaskId = null"
            />
        </div>
        <add-task-form v-if="showAddForm" @add-task="add-task" @close="showAddForm = false" />
        <button v-if="!showAddForm" @click="showAddForm = true" class="add-task-btn">Add task</button>
    </div>
    `,
    data(){
        return {
            columns: [
                { title: 'Запланированные задачи', tasks: [] },
                { title: 'Задачи в работе', tasks: [] },
                { title: 'Тестирование', tasks: [] },
                { title: 'Выполненные задачи', tasks: [] }
            ],
            editingTaskId: null,
            showAddForm: false,
            showNotification: false,
            notificationMessage: '',
            notificationImage: 'src/imgs/warn1_image.png'
        }
    },
    created(){
        const savedData = localStorage.getItem('kanbanBoardState')
        if (savedData) {
            try {
                const parsed = JSON.parse(savedData)
                this.columns = parsed.columns || this.columns
            } catch (e) {
                console.log(e)
            }
        }
    },
    watch: {
        columns: {
            handler() {
                this.saveState()
            },
            deep: true
        }
    },
    methods:{
        saveState() {
            const state = { columns: this.columns }
            localStorage.setItem('kanbanBoardState', JSON.stringify(state))
        },
        addTask(task) {
            const newTask = {
                id: Date.now().toString(),
                createdAt: new Date().toISOString(),
                ...task
            }
            this.columns[0].tasks.push(newTask)
            this.showAddForm = false
        },
        deleteTask(taskId) {
            const firstColumnTasks = this.columns[0].tasks
            const taskIndex = firstColumnTasks.findIndex(task => task.id === taskId)
            if (taskIndex !== -1) {
                firstColumnTasks.splice(taskIndex, 1)
            }
        },
        moveTask(taskId, targetColumnIndex, updatedTask = null){
            let sourceColumnIndex = -1
            let task = null

            for(let i =0; i< this.columns.length; i++){
                const taskIndex = this.columns[i].tasks.findIndex(t => t.id === taskId)
                if(taskIndex !== -1){
                    sourceColumnIndex = i
                    task = this.columns[i].tasks[taskIndex]
                    break
                }
            }

            if(sourceColumnIndex === -1 || task === null) return

            this.columns[sourceColumnIndex].tasks.splice(this.columns[sourceColumnIndex].tasks.findIndex(t => t.id === taskId), 1)
            if(updatedTask){
                task = updatedTask
            }
            this.columns[targetColumnIndex].tasks.push(task)
            this.editingTaskId = null
        },
        updateTask(updatedTask){
            for(let i =0; i< this.columns.length; i++){
                const taskIndex = this.columns[i].tasks.findIndex(t => t.id === updatedTask.id)
                if(taskIndex !== -1){
                    this.columns[i].tasks[taskIndex] = updatedTask
                    break
                }
            }
            this.editingTaskId = null
        },
        startEditing(taskId) {
            this.editingTaskId = taskId
        },
        showNotificationMessage(message, url) {
            if (url) this.notificationImage = url
            this.notificationMessage = message
            this.showNotification = true
        },
        hideNotification() {
            this.showNotification = false
        }
    }
})


Vue.component('add-task-form', {
    template: `
    <div class="add-task-form-overlay">
        <div class="add-task-form">
            <h3>Add new task</h3>
            <form @submit.prevent="submitTask">
                <div class="form-group">
                    <label for="task-title">Title</label>
                    <input type="text" id="task-title" v-model="title" required class="form-control">
                </div>
                <div class="form-group">
                    <label for="task-desc">Description</label>
                    <textarea id="task-desc" v-model="description" class="form-control"></textarea>
                </div>
                
                <div class="form-group">
                    <label for="task-deadline">Deadline</label>
                    <input type="datetime-local" id="task-deadline" v-model="deadline" required class="form-control">
                </div>
                
                <div class="form-actions">
                    <button type="submit" class="btn-submit">Add Task</button>
                    <button type="button" @click="$emit('close')" class="btn-cancel">Cancel</button>
                </div>
            </form>
        </div>
    </div>
    `,
    data() {
        return {
            title: '',
            description: '',
            deadline: ''
        }
    },
    methods: {
        submitTask() {
            if (!this.title || !this.deadline) {
                eventBus.$emit('show-notification', 'Title and deadline are required, bitch')
                return
            }
            const task = {
                title: this.title,
                description: this.description,
                deadline: this.deadline
            }
            this.$emit('add-task', task)
            this.title = ''
            this.description = ''
            this.deadline = ''
        }
    }
})









Vue.component('table-cards', {
    template: `
    <div class="notes-table">
        <notification-popka :show="showNotification" :message="notificationMessage" :imageUrl="notificationImage" @close="hideNotification"></notification-popka>
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
                    <note-card :noteDetail="note" :columnIndex="2" :isDisabled="true" ></note-card>
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
        columnIndex: Number,
        isLocked: Boolean,
        isDisabled: Boolean,

    },
    template: `
    <div class="note">
        <ul class="note-list">
            <h3>{{noteDetail.title}}</h3>
            <li :class="{completed: noteDetail.item1Checked}">
                <input type="checkbox" :id="'note-item1-'+ _uid" v-model="noteDetail.item1Checked" :disabled="isLocked" :disabled="isDisabled">
                <label :for="'note-item1-'+ _uid">{{noteDetail.item1}}</label>
            </li>
            <li :class="{completed: noteDetail.item2Checked}">
                <input type="checkbox" :id="'note-item2-'+ _uid" v-model="noteDetail.item2Checked" :disabled="isLocked" :disabled="isDisabled">
                <label :for="'note-item2-'+ _uid">{{noteDetail.item2}}</label>
            </li>
            <li :class="{completed: noteDetail.item3Checked}">
                <input type="checkbox" :id="'note-item3-'+ _uid" v-model="noteDetail.item3Checked" :disabled="isLocked" :disabled="isDisabled">
                <label :for="'note-item3-'+ _uid">{{noteDetail.item3}}</label>
            </li>
            <li v-if="noteDetail.item4" :class="{completed: noteDetail.item4Checked}">
                <input type="checkbox" :id="'note-item4-'+ _uid" v-model="noteDetail.item4Checked" :disabled="isLocked" :disabled="isDisabled">
                <label :for="'note-item4-'+ _uid">{{noteDetail.item4}}</label>
            </li>
            <li v-if="noteDetail.item5" :class="{completed: noteDetail.item5Checked}">
                <input type="checkbox" :id="'note-item5-'+ _uid" v-model="noteDetail.item5Checked" :disabled="isLocked" :disabled="isDisabled">
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
                <input type="text" id="title" placeholder="title" v-model="title" :class="{inputNotFilled: isTitleNotFilled}">
                <ul class="notes-adding-list">
                    <li>
                        <label for="item1">1</label>
                        <input type="text" id="item1" v-model="item1" :class="{inputNotFilled: isItem1NotFilled}">
                    </li>
                    <li>
                        <label for="item2">2</label>
                        <input type="text" id="item2" v-model="item2" :class="{inputNotFilled: isItem2NotFilled}">
                    </li>
                    <li>
                        <label for="item3">3</label>
                        <input type="text" id="item3" v-model="item3" :class="{inputNotFilled: isItem3NotFilled}">
                    </li>
                    <li v-if="item1 && item2 && item3">
                        <label for="item4">4</label>
                        <input type="text" id="item4" v-model="item4">
                    </li>
                    <li v-if="item1 && item2 && item3 && item4">
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