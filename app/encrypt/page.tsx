'use client';

import React, { useState } from 'react';
import * as openpgp from 'openpgp';
import { Button } from '@/components/ui/button';
import { Copy, Lock } from 'lucide-react';

export default function EncryptPage() {
  const [message, setMessage] = useState('');
  const [encryptedMessage, setEncryptedMessage] = useState('');

  const handleEncrypt = async () => {
    try {
      const publicKeyArmored = process.env.NEXT_PUBLIC_PUBLIC_KEY!;
      const privateKeyArmored = process.env.NEXT_PUBLIC_PRIVATE_KEY!;
      const passphrase = process.env.NEXT_PUBLIC_PASSPHRASE!;

      const publicKey = await openpgp.readKey({ armoredKey: publicKeyArmored });
      const privateKey = await openpgp.decryptKey({
        privateKey: await openpgp.readPrivateKey({ armoredKey: privateKeyArmored }),
        passphrase,
      });

      const encrypted = await openpgp.encrypt({
        message: await openpgp.createMessage({ text: message }),
        encryptionKeys: publicKey,
        signingKeys: privateKey,
      });

      setEncryptedMessage(encrypted.toString());
    } catch (error) {
      console.error('Encryption failed:', error);
    }
  };

  return (
    <main>
        <div className="min-h-screen">
        <section className='container mx-auto py-20 text-center mt-8'>
        <h1 className="text-6xl sm:text-7xl lg:text-8xl font-extrabold gradient-title pb-6 flex flex-col mb-10">
            Encrypt Message
        </h1>
        <textarea
            className="w-full min-h-[300px] p-3 mb-4 rounded-md border border-gray-700 bg-gray-900 text-white"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Enter your message here"
        />
        <Button 
            onClick={handleEncrypt}
            variant={"outline"}
            className='px-4 py-2'
        >
            Encrypt
            <Lock className='w-4 h-4' />
        </Button>

        {encryptedMessage && (
          <div className='mt-6 mb-6 rounded-lg relative'>
            <div className='absolute top-4 right-4 flex space-x-2'>
              <button 
                onClick={() => navigator.clipboard.writeText(encryptedMessage)}
                className='text-gray-400 hover:text-blue-900'
                title='Copy to clipboard'
              >
                <Copy className="h-5 w-5" />
              </button>
            </div>
            <pre className='p-3 bg-gray-900 rounded-md text-white'>{encryptedMessage}</pre>
          </div>
        )}
        </section>
        </div>
    </main>
  );
}