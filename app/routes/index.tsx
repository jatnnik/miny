import { Link } from 'remix'
import animationStyles from '../styles/animations.css'

export const links = () => {
  return [{ rel: 'stylesheet', href: animationStyles }]
}

export default function Index() {
  return (
    <main>
      <aside className='p-12 bg-gradient-to-tr from-gray-900 to-gray-800 sm:p-16 lg:p-24 lg:py-36'>
        <div className='max-w-3xl mx-auto text-center'>
          <span className='wave'>
            <img
              src='/images/waving-hand.png'
              alt='Waving hand emoji'
              className='h-10 w-10 mx-auto'
              width={40}
              height={40}
            />
          </span>

          <h1 className='my-4 text-5xl font-semibold text-transparent bg-clip-text bg-gradient-to-br from-pink-400 to-purple-600 leading-none tracking-tight sm:text-7xl lg:text-8xl'>
            Deine neue App
            <br />
            für Diensttermine.
          </h1>

          <h2 className='md:text-lg lg:text-2xl text-gray-200 my-6'>
            Freie Termine eintragen, Link verschicken, fertig.
          </h2>

          <form className='mt-8 max-w-xl mx-auto sm:flex'>
            <div className='sm:flex-1'>
              <label htmlFor='email' className='sr-only'>
                E-Mail
              </label>

              <input
                type='email'
                placeholder='Deine E-Mail Adresse'
                className='w-full p-3 text-white bg-gray-800 border-2 border-gray-700 rounded-lg focus:border-indigo-500'
              />
            </div>

            <button
              type='submit'
              className='flex items-center justify-between w-full px-5 py-3 mt-4 font-medium text-white bg-indigo-500 rounded-lg transition-colors sm:w-auto sm:mt-0 sm:ml-4 hover:bg-indigo-400'
            >
              Registrieren
              <svg
                xmlns='http://www.w3.org/2000/svg'
                fill='none'
                viewBox='0 0 24 24'
                stroke='currentColor'
                className='flex-shrink-0 w-4 h-4 ml-3'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth='2'
                  d='M14 5l7 7m0 0l-7 7m7-7H3'
                />
              </svg>
            </button>
          </form>

          <p className='text-gray-300 text-sm mt-8'>
            <strong className='text-purple-400'>42</strong> Personen nutzen miny schon
          </p>
        </div>
      </aside>

      <section className='bg-white'>
        <div className='max-w-screen-xl mx-auto px-4 py-24 sm:px-6 lg:px-8'>
          <div className='grid grid-cols-1 lg:grid-cols-2 gap-y-8 gap-x-16 lg:items-center'>
            <div className='max-w-lg px-4 mx-auto text-center lg:text-left lg:mx-0 lg:px-0'>
              <h3 className='text-2xl font-bold text-gray-900 sm:text-3xl'>
                Diensttermine ganz einfach per Link vereinbaren
              </h3>

              <p className='mt-4 text-lg text-gray-500'>
                Lorem ipsum dolor sit amet consectetur adipisicing elit. Cumque doloremque qui
                fugiat illum? Nam possimus vero id quibusdam repudiandae debitis exercitationem
                dolorem dolorum! Error corporis iure eum, repellat molestiae cum?
              </p>

              <a
                className='inline-block px-5 py-3 mt-8 font-medium text-white bg-blue-600 rounded-lg'
                href=''
              >
                Jetzt registrieren
              </a>
            </div>

            <div className='grid grid-cols-2 gap-4 sm:grid-cols-3 lg:order-first'>
              <a className='block p-4 bg-white border border-gray-100 shadow-sm rounded-xl' href=''>
                <span className='inline-block p-3 text-purple-900 rounded-lg bg-purple-50'>
                  <svg
                    xmlns='http://www.w3.org/2000/svg'
                    className='h-6 w-6'
                    fill='none'
                    viewBox='0 0 24 24'
                    stroke='currentColor'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M12 19l9 2-9-18-9 18 9-2zm0 0v-8'
                    />
                  </svg>
                </span>

                <h6 className='mt-2 font-medium text-gray-900'>Praktisch</h6>
                <p className='hidden mt-1 text-sm text-gray-500 sm:block'>
                  Freie Termine einfach per Link teilen
                </p>
              </a>

              <a className='block p-4 bg-white border border-gray-100 shadow-sm rounded-xl' href=''>
                <span className='inline-block p-3 text-blue-900 rounded-lg bg-blue-50'>
                  <svg
                    xmlns='http://www.w3.org/2000/svg'
                    className='h-6 w-6'
                    fill='none'
                    viewBox='0 0 24 24'
                    stroke='currentColor'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
                    />
                  </svg>
                </span>

                <h6 className='mt-2 font-medium text-gray-900'>Einfach</h6>
                <p className='hidden mt-1 text-sm text-gray-500 sm:block'>
                  miny ist ganz einfach zu benutzen
                </p>
              </a>

              <a className='block p-4 bg-white border border-gray-100 shadow-sm rounded-xl' href=''>
                <span className='inline-block p-3 text-orange-900 rounded-lg bg-orange-50'>
                  <svg
                    xmlns='http://www.w3.org/2000/svg'
                    className='h-6 w-6'
                    fill='none'
                    viewBox='0 0 24 24'
                    stroke='currentColor'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z'
                    />
                  </svg>
                </span>

                <h6 className='mt-2 font-medium text-gray-900'>Schnell</h6>
                <p className='hidden mt-1 text-sm text-gray-500 sm:block'>
                  miny spart dir wertvolle Zeit
                </p>
              </a>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
