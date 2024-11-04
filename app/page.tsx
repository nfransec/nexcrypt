'use client';

import { useState, useEffect } from "react";
import { Amplify } from "aws-amplify";
import outputs from "@/amplify_outputs.json";
import "@aws-amplify/ui-react/styles.css";
import { Button } from "@/components/ui/button";
import { Copy, Key, Trash2 } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  FileUploader,
  FileUploaderContent,
  FileUploaderItem,
  FileInput,
} from '@/components/custom-file-uploader';
import { Paperclip } from "lucide-react";
import * as openpgp from 'openpgp';

Amplify.configure(outputs);

const FileSvgDraw = () => {
  return (
    <>
      <svg
        className="w-8 h-8 mb-3 text-gray-500 dark:text-gray-400"
        aria-hidden="true"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 20 16"
      >
        <path
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"
        />
      </svg>
      <p className="mb-1 text-sm text-gray-500 dark:text-gray-400">
        <span className="font-semibold">Click to upload</span>
        &nbsp; or drag and drop
      </p>
      <p className="text-xs text-gray-500 dark:text-gray-400">
        TXT, EML, or PGP
      </p>
    </>
  );
};

export default function HomePage() {
  const [encryptedMessage, setEncryptedMessage] = useState('');
  const [decryptedMessage, setDecryptedMessage] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [files, setFiles] = useState<File[]>([]);

  const dropZoneConfig = {
    maxFiles: 5,
    maxSize: 1024 * 1024 * 4,
    multiple: true,
  };

  useEffect(() => {
    const storedHistory = localStorage.getItem('decryptionHistory');
    if (!storedHistory) {
      localStorage.setItem('decryptionHistory', JSON.stringify([]));
    }
  }, []);

  const updateHistory = (input: string, output: string, type: 'text' | 'file', filename?: string) => {
    const storedHistory = localStorage.getItem('decryptionHistory');
    const history = storedHistory ? JSON.parse(storedHistory) : [];
    history.push({ input, output, type, filename });
    localStorage.setItem('decryptionHistory', JSON.stringify(history));
  };

  const handleFileUpload = (uploadedFiles: File[]) => {
    const file = uploadedFiles[0];
    if (file && /\.(txt|eml|pgp)$/i.test(file.name)) {
      const reader = new FileReader();
      reader.onload = () => {
        const content = reader.result as string;
        setEncryptedMessage(content);
      };
      reader.readAsText(file);
    } else {
      setError('Please upload a valid .txt, .eml, or .pgp file');
    }
  };

  const handleDecrypt = async (content: string, type: 'text' | 'file', filename?: string) => {
    try {
      const privateKeyArmored = process.env.NEXT_PUBLIC_PRIVATE_KEY;
      const passphrase = process.env.NEXT_PUBLIC_PASSPHRASE;

      if (!privateKeyArmored || !passphrase) {
        throw new Error('Private key or passphrase not found');
      }

      const privateKey = await openpgp.decryptKey({
        privateKey: await openpgp.readPrivateKey({ armoredKey: privateKeyArmored }),
        passphrase,
      });

      const message = await openpgp.readMessage({
        armoredMessage: content,
      });

      const { data: decrypted } = await openpgp.decrypt({
        message,
        decryptionKeys: privateKey,
      });

      const decryptedString = typeof decrypted === 'string' ? decrypted : await streamToString(decrypted as ReadableStream<Uint8Array>);

      setDecryptedMessage(decryptedString);
      updateHistory(content, decryptedString, type, filename);
    } catch (err) {
      console.error('Decryption Error: ', err);
      setError('Decryption failed');
    }
  };

  return (
    <main>
      <div className='min-h-screen'>
        <section className='container mx-auto py-20 text-center'>
          <h1 className='text-6xl sm:text-7xl lg:text-8xl font-extrabold gradient-title pb-6 flex flex-col'>
            CSIRT PGP Toolkit
          </h1>
          <p className='text-lg text-gray-400 mb-10 max-w-3xl mx-auto'>
            Securely encrypt and decrypt emails/messages with ease using our powerful PGP toolkit.
          </p>

          <textarea 
            className='w-full p-3 mb-4 rounded-md border border-gray-700 bg-gray-900 text-white h-[300px]'
            value={encryptedMessage}
            onChange={(e) => setEncryptedMessage(e.target.value)}
            placeholder="Enter text to decrypt..."
          />
          
          <FileUploader
            value={files}
            onValueChange={handleFileUpload}
            dropzoneOptions={dropZoneConfig}
            className="relative bg-gray-800 rounded-lg p-1"
          >
            <FileInput className='outline-dashed outline-1 outline-white bg-gray-900'>
              <div className="flex items-center justify-center flex-col pt-3 pb-4 w-full">
                <FileSvgDraw />
              </div>
            </FileInput>
            <FileUploaderContent>
              {files && 
                files.length > 0 && 
                files.map((file, i) => (
                  <FileUploaderItem key={i} index={i}>
                    <Paperclip className="h-4 w-4 stroke-current" />
                    <span>{file.name}</span>
                  </FileUploaderItem>
                ))
              }
            </FileUploaderContent>
          </FileUploader>

          <Button size="lg" className="mr-2 mt-4 mb-8" variant='destructive'
            onClick={() => handleDecrypt(encryptedMessage, 'text')}
          >
            Decrypt <Key className='w-4 h-4' />
          </Button>


          {error && (
            <Alert variant="destructive" className="mt-4 mb-4">
              <AlertTitle>Error Occurred</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          {decryptedMessage ? (
            <div className='bg-gray-900 p-6 rounded-lg border border-gray-700 mt-8 relative'>
              <div className='absolute top-3 right-3 flex space-x-2'>
                <button
                  onClick={() => navigator.clipboard.writeText(decryptedMessage)}
                  className="text-gray-400 hover:text-emerald-500"
                  title="Copy to clipboard"
                >
                  <Copy className="h-5 w-5" />
                </button>
                
              </div>
              <div className="min-h-[200px] overflow-auto text-gray-300">
                <p className="whitespace-pre-wrap">{decryptedMessage}</p>
              </div>
              <button onClick={() => setDecryptedMessage('')}><Trash2 className="h-5 w-5 text-white hover:text-red-500" /></button>
            </div>
          ) : (
            <div className='min-h-[150px] bg-gray-900  rounded-lg flex items-center justify-center text-blue-800'>
              Decrypted message will appear here...
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

async function streamToString(stream: ReadableStream<Uint8Array>): Promise<string> {
  const reader = stream.getReader();
  const decoder = new TextDecoder();
  let result = '';
  let done = false;

  while (!done) {
    const { value, done: doneReading } = await reader.read();
    done = doneReading;
    if (value) {
      result += decoder.decode(value, { stream: true });
    }
  }

  return result;
}