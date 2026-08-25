import Image from 'next/image'
import { Ubuntu } from 'next/font/google'
import { SiteNav } from '@/components/site-nav'
import { PlacaForm } from '@/components/placa-form'
import { CentralAtendimento } from '@/components/central-atendimento'
import { SiteFooter } from '@/components/site-footer'

const ubuntu = Ubuntu({
  subsets: ['latin'],
  weight: ['300', '400', '500', '700'],
})

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col bg-black">
      <section
        id="inicio"
        className="relative flex min-h-[100vh] flex-col overflow-hidden"
        aria-label="Seção inicial"
      >
        <div className="absolute inset-0 z-0">
          <Image
            src="/images/hero-carro.png"
            alt="Amigos dirigindo em um carro"
            fill
            priority
            sizes="100vw"
            className="object-cover object-[65%_center] opacity-90 lg:object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/70 lg:bg-gradient-to-r lg:from-black/80 lg:via-black/20 lg:to-black/60" />
        </div>

        <SiteNav />

        <div
          className="
            relative z-10 mx-auto flex w-full max-w-[1140px] flex-1 flex-col
            items-center justify-center gap-12
            px-6 pt-24 pb-12
            lg:flex-row lg:justify-between lg:gap-16 lg:px-8 lg:pt-0 lg:pb-0
            min-h-[calc(100vh-80px)]
          "
        >
          <div className="w-full max-w-[640px] text-left flex flex-col justify-center">
            <h1 className={`${ubuntu.className} font-bold uppercase tracking-[1px] md:tracking-[2px] leading-[1.3] lg:leading-[1.4] text-white text-[1.75rem] sm:text-[2.3rem] md:text-[3rem] lg:text-[3.4rem]`}>
  DESFRUTE DE TODA A<br />
  COMODIDADE DO<br />
  PEDÁGIO <span className="text-[#e5ff51]">DIGITAL</span>
</h1>

            <p
              className={`${ubuntu.className} mt-5 md:mt-6 text-sm font-regular text-white md:text-base tracking-normal max-w-[520px]`}
            >
              Uma nova era para o pedágio começou: ágil e digital como tem que ser.
            </p>
          </div>

          <div className="w-full shrink-0 lg:max-w-[390px]">
            <PlacaForm />
          </div>
        </div>
      </section>

      <SiteFooter />
    </main>
  )
}