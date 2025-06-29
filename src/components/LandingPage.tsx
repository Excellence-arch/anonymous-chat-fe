'use client';

import { useThemeStore } from '../store/themeStore';
import { motion } from 'framer-motion';
import Header from './Layout/Header'; // Adjust the import path as needed
import { Link } from 'react-router-dom';

const LandingPage = () => {
  const { isDark } = useThemeStore();

  return (
    <div
      className={`min-h-screen transition-colors duration-300 ${
        isDark ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'
      }`}
    >
      {/* <Header /> */}

      <main className="container mx-auto px-4 py-16 mt-16">
        <section className="flex flex-col md:flex-row items-center gap-12 mb-20">
          <div className="flex-1">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-4xl md:text-5xl font-bold mb-6"
            >
              Truly anonymous <span className="text-blue-600">chatting</span>{' '}
              experience
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className={`text-lg mb-8 ${
                isDark ? 'text-gray-300' : 'text-gray-600'
              }`}
            >
              Connect with others without revealing your identity. Our secure
              platform ensures your privacy while you enjoy meaningful
              conversations.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex space-x-4"
            >
              <Link
                to="/register"
                className={`px-6 py-3 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition font-medium ${
                  isDark ? 'shadow-lg shadow-blue-600/20' : ''
                }`}
              >
                Get Started
              </Link>
              <Link
                to="/about"
                className={`px-6 py-3 rounded-lg border ${
                  isDark
                    ? 'border-gray-700 hover:bg-gray-800'
                    : 'border-gray-300 hover:bg-gray-100'
                } transition font-medium`}
              >
                Learn More
              </Link>
            </motion.div>
          </div>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 }}
            className="flex-1"
          >
            <div
              className={`p-2 rounded-2xl ${
                isDark ? 'bg-gray-800' : 'bg-white'
              } shadow-xl`}
            >
              <div
                className={`rounded-xl overflow-hidden border ${
                  isDark ? 'border-gray-700' : 'border-gray-200'
                }`}
              >
                {/* Mock chat UI */}
                <div
                  className={`p-4 ${
                    isDark ? 'bg-gray-700' : 'bg-gray-100'
                  } flex items-center border-b ${
                    isDark ? 'border-gray-600' : 'border-gray-200'
                  }`}
                >
                  <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-blue-500"></div>
                  <div className="ml-3">
                    <div className="font-medium">Anonymous User</div>
                    <div
                      className={`text-xs ${
                        isDark ? 'text-gray-400' : 'text-gray-500'
                      }`}
                    >
                      Online
                    </div>
                  </div>
                </div>
                <div
                  className={`h-64 p-4 ${
                    isDark ? 'bg-gray-800' : 'bg-white'
                  } space-y-3`}
                >
                  <div className="flex justify-start">
                    <div
                      className={`max-w-xs p-3 rounded-lg ${
                        isDark ? 'bg-gray-700' : 'bg-gray-200'
                      }`}
                    >
                      Hi there! How are you?
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <div className="max-w-xs p-3 rounded-lg bg-blue-600 text-white">
                      I'm good! Just enjoying this anonymous chat
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </section>

        <section
          className={`py-16 ${
            isDark ? 'bg-gray-800' : 'bg-gray-100'
          } rounded-3xl px-8 mb-20`}
        >
          <h2 className="text-3xl font-bold text-center mb-12">Features</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: 'Complete Anonymity',
                description:
                  'No personal information shared. Just your chosen username and avatar.',
                icon: '🕵️',
              },
              {
                title: 'Secure Messaging',
                description:
                  'All messages are scanned for personal information before delivery.',
                icon: '🔒',
              },
              {
                title: 'Dark/Light Mode',
                description:
                  'Choose your preferred theme or follow system settings.',
                icon: '🌓',
              },
            ].map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * index }}
                className={`p-6 rounded-xl ${
                  isDark ? 'bg-gray-700' : 'bg-white'
                } shadow-sm`}
              >
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                <p className={`${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </section>
      </main>

      <footer
        className={`py-8 ${
          isDark
            ? 'bg-gray-800 border-t border-gray-700'
            : 'bg-white border-t border-gray-200'
        }`}
      >
        <div className="container mx-auto px-4 text-center">
          <p className={`${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
            © {new Date().getFullYear()} Anonymous Chat. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
