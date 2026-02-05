// let product = "Socks"

let eventBus = new Vue()

Vue.component('product', {
    props: {
        premium: {
            type: Boolean,
            required: true
        },
    },
    template: `
    <div class="product">
        <div class="product-image">
                <img :src="image" :alt="altText">
        </div>
        <div class="product-info">
            <h1>{{ title }}</h1>
            <p v-if="inStock">In stock</p>
            <p v-else>Out of stock</p>
            <ul>
                <li v-for="detail in details">{{ detail }}</li>
            </ul>
            <p>Shipping: {{ shipping }} </p>
            <div class="color-box" v-for="(variant, index) in variants" :key="variant.variantId"
                :style="{ backgroundColor:variant.variantColor}" @mouseover="updateProduct(index)"></div>
            
            <button v-on:click="addToCart" :disabled="!inStock" :class="{ disabledButton: !inStock }">Add to
                cart</button>
            <button v-on:click="deleteFromCart" :disabled="!inStock" :class="{ disabledButton: !inStock }">Delete from cart</button>
            <!-- <p>{{ isOnSale }}</p> -->
            
        </div>
        <div>
            <product-tabs :reviews="reviews"></product-tabs>
        </div>
    </div>
    `,
    data() {
        return {
            product: "Socks",
            brand: 'Vue Mastery',
            selectedVariant: 0,
            // image: "./assets/vmSocks-green-onWhite.jpg",
            // image: "./assets/vmSocks-blue-onWhite.jpg",
            altText: 'A pair of socks',
            // inStock: true,
            onSale: true,
            details: ['80% cotton', '20% polyster', 'Gender-neutral'],
            variants: [
                {
                    variantId: 1111,
                    variantColor: 'green',
                    variantImage: './assets/vmSocks-green-onWhite.jpg',
                    variantQuantity: 10,
                },
                {
                    variantId: 1112,
                    variantColor: 'blue',
                    variantImage: './assets/vmSocks-blue-onWhite.jpg',
                    variantQuantity: 0,
                }
            ],
            reviews: [],

        }
    },
    methods: {
        addToCart() {
            this.$emit('add-to-cart', this.variants[this.selectedVariant].variantId)
            console.log('Вызвался метод addToCart')
        },
        deleteFromCart() {
            this.$emit('delete-from-cart', this.variants[this.selectedVariant].variantId)
        },
        updateProduct(index) {
            this.selectedVariant = index;
            console.log(index)
        },
    },
    mounted(){
        eventBus.$on('review-submitted', productReview => {
        this.reviews.push(productReview)
    })},
    computed: {
        title() {
            return this.brand + ' ' + this.product
        },
        image() {
            return this.variants[this.selectedVariant].variantImage
        },
        inStock() {
            return this.variants[this.selectedVariant].variantQuantity
        },
        isOnSale() {
            return this.onSale ? 'Распродажа для ' + this.title : 'Распродажи нет'
        },
        shipping() {
            if (this.premium) {
                return "Free"
            } else {
                return 2.99
            }
        },
    }
})



Vue.component('product-details', {
    template: `
    <ul>
        <li v-for="detail in details">{{ detail }}</li>
    </ul>
    `,
    data() {
        return {
            details: ['80% cotton', '20% polyster', 'Gender-neutral'],
        }
    }
})

Vue.component('product-review', {
    template: `
    <form class="review-form" @submit.prevent="onSubmit">
            <p v-if="errors.length">
                <b>Please correct the following error(s):</b>
                <ul>
                    <li v-for="error in errors">{{error}}</li>
                </ul>
            </p>
                <p>
                    <label for="name">Name:</label>
                    <input type="text" id="name" placeholder="name" v-model="name">
                </p>
                <p>
                    <label for="review">Review:</label>
                    <textarea id="review" v-model="review"></textarea>
                </p>
                <p>
                    <label for="rating">Rating:</label>
                    <select id="rating" v-model.number="rating">
                        <option value="5">5</option>
                        <option value="4">4</option>
                        <option value="3">3</option>
                        <option value="2">2</option>
                        <option value="1">1</option>
                    </select>
                </p>
                <p>
                    <label for="recommend">Would you recommended this product?</label>
                    <label>
                        <input type="radio" name="recommend" value="yes" v-model="recommended">
                        Да
                    </label>
                    <label>
                        <input type="radio" name="recommend" value="no" v-model="recommended">
                        Нет
                    </label>
                </p>
                <p>
                    <input type="submit" value="Submit">
                </p>
            </form>
    `,
    data() {
        return {
            name: null,
            review: null,
            rating: null,
            recommended: null,
            errors: [],
        }
    },
    methods: {
        onSubmit() {
            if (this.name && this.review && this.rating) {
                let productReview = {
                    name: this.name,
                    review: this.review,
                    rating: this.rating,
                    recommended: this.recommended
                }
                console.log(productReview)
                // this.$emit('review-submitted', productReview)
                eventBus.$emit('review-submitted', productReview)
                console.log('Событие review-submitted')
                this.name = null
                this.review = null
                this.rating = null
                this.recommended = null
            } else {
                if (!this.name) this.errors.push("Name required.")
                if (!this.review) this.errors.push("Review required.")
                if (!this.rating) this.errors.push("Rating required.")
                if (!this.recommended) this.errors.push("Recomendation is required")
            }


        }
    }
})


Vue.component('product-tabs', {
    props: {
        reviews: {
            type: Array,
            required: false,
        }
    },
    template:
        `<div>
            <ul>
                <span class="tab" :class="{ activeTab: selectedTab === tab }" v-for="(tab, index) in tabs" @click="selectedTab = tab">{{tab}}</span>
            </ul>
            <div v-show="selectedTab === 'Reviews'">
                <p v-if="!reviews.length">There are no reviews yet</p>
                <ul>
                    <li v-for="review in reviews">
                        <p>{{ review.name }}</p>
                        <p>Rating: {{ review.rating }}</p>
                        <p>{{ review.review }}</p>
                    </li>
                </ul>
            </div>
            <div v-show="selectedTab === 'Make a Review'">
                <product-review></product-review>
            </div>
        </div>
    `,
    data() {
        return {
            tabs: ['Reviews', 'Make a Review'],
            selectedTab: 'Reviews',
        }
    },
    methods: {
        // addReview(productReview) {
        //     this.reviews.push(productReview)
        //     console.log('Событие addReview')
        // }
    }
})




let app = new Vue({
    el: '#app',
    data: {
        premium: true,
        cart: [],
    },
    methods: {
        updateCart(id) {
            this.cart.push(id)
        },
        updateDeleteFromCart(id) {
            this.cart.pop(id)
        }
    }
})

