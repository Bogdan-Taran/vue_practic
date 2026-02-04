// let product = "Socks"
let app = new Vue({
    el: '#app',
    data: {
        product: "Socks",
        image: "./assets/vmSocks-green-onWhite.jpg",
        // image: "./assets/vmSocks-blue-onWhite.jpg",
        altText: 'A pair of socks',
        inStock: true,
        inventory: 100,
        onSale: false,
    }
})