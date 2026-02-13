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
                    <p v-if="task.editedAt"><strong>Last edit:</strong> {{formatDate(task.editedAt)}}</p>
                    <p v-if="task.completedAt"><strong>Completed:</strong> {{formatDate(task.completedAt)}}</p>
                    <p v-if="task.returnReason"><strong>Return reason:</strong> {{task.returnReason}}</p>
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
            return new Date(this.task.deadline) < new Date()
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
            <task-card v-for="task in tasks" :key="task.id" :task="task" :column-index="columnIndex" :isEditing="editingTaskId === task.id" @edit="$emit('start-edit', task.id)" @delete="$emit('delete-task', task.id)" @move="$emit('move-task', task.id, $event)" @update-task="$emit('update-task', $event)" @cancel-edit="$emit('cancel-edit')"/>
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
        <add-task-form v-if="showAddForm" @add-task="addTask" @close="showAddForm = false" />
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