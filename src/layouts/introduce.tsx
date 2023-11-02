import { defineComponent, onMounted, ref } from 'vue'
import Typed from 'typed.js'
import '@/assets/pages/introduce.scss'
export default defineComponent({
  setup() {
    const el = ref(null)
    const introduce = ["Hi, I'm cc heart"].join('<br />')
    onMounted(() => {
      new Typed(el.value, {
        strings: [introduce],
        typeSpeed: 40,
      })
    })

    return () => (
      <div>
        <p class="introduce-text h-70vh flex items-center justify-center">
          <span ref={el}></span>
        </p>
      </div>
    )
  },
})
