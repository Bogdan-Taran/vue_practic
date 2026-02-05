// let product = "Socks"
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

        }
    },
    methods: {
        addToCart() {
            this.$emit('add-to-cart', this.variants[this.selectedVariant].variantId)
            console.log('Вызвался метод addToCart')
        },
        deleteFromCart(){
            this.$emit('delete-from-cart', this.variants[this.selectedVariant].variantId)
        },
        updateProduct(index) {
            this.selectedVariant = index;
            console.log(index)
        }
    },
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
        updateDeleteFromCart(id){
            this.cart.pop(id)
        }
    }
})