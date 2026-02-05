// let product = "Socks"
let app = new Vue({
    el: '#app',
    data: {
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
        cart: 0,
    },
    methods: {
        addToCart() {
            this.cart += 1
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
        }
    }

})