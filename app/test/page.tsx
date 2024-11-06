'use client'

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Switch } from "@/components/ui/switch"
import { FileIcon, Upload, X, ChevronDown, Globe, Key, Download, Copy, FilesIcon } from "lucide-react"
import { FileUploader, FileUploaderContent, FileInput } from '@/components/custom-file-uploader'
import * as openpgp from 'openpgp';
import { toast } from 'sonner';

export default function TestPage() {
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [decryptedFiles, setDecryptedFiles] = useState<{ filename: string; content: string }[]>([]);
  const [error, setError] = useState<string | null>(null);

  const handleFileUpload = (files: File[]) => {
    // Clear previous errors
    setError(null);

    // Validate files
    const validFiles: File[] = [];
    const maxFileSize = 50 * 1024 * 1024; // 50 MB
    const allowedFileTypes = /\.(txt|eml|pgp|gpg)$/i; // Allowed file types

    for (const file of files) {
        if (!allowedFileTypes.test(file.name)) {
            toast.error(`Invalid file type: ${file.name}. Only .txt, .eml, .pgp, and .gpg files are allowed.`);
            continue;
        }
        if (file.size > maxFileSize) {
            toast.error(`File size exceeds limit: ${file.name}. Maximum size is 50 MB.`);
            continue;
        }
        validFiles.push(file);
    }

    // Update state with valid files
    setUploadedFiles(validFiles);
  };

  const fetchKey = () => {
    const key1 = process.env.NEXT_PUBLIC_PGP_KEY_PART1 || '';
    const key2 = process.env.NEXT_PUBLIC_PGP_KEY_PART2 || '';
    const key3 = process.env.NEXT_PUBLIC_PGP_KEY_PART3 || '';
    const key4 = process.env.NEXT_PUBLIC_PGP_KEY_PART4 || '';
    const pKey = key1 + key2 + key3 + key4;

    return `-----BEGIN PGP PRIVATE KEY BLOCK-----\n\n${pKey}\n\n-----END PGP PRIVATE KEY BLOCK-----`;
  };

  const handleDecrypt = async (content: string, type: 'text' | 'file', filename?: string) => {
    setError(null);

    if (!content) {
      const errorMessage = 'Input seems EMPTY!!! Enter a valid PGP encrypted text!';
      toast.error(errorMessage);
      return;
    }

    try {
      await openpgp.readMessage({
        armoredMessage: content,
      });

      const privateKeyArmored = fetchKey();

      if (!privateKeyArmored || typeof privateKeyArmored !== 'string') {
        throw new Error('Private key not found or is not a valid string');
      }

      const passphrase = process.env.NEXT_PUBLIC_PASSPHRASE;

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

      return decryptedString;
    } catch (err) {
      console.error('Decryption Error: ', err);
      let errorMessage = 'oops! something went wrong, try again!';

      if (err instanceof Error) {
        errorMessage = err.message;
      } else if (typeof err === 'string') {
        errorMessage = err;
      }

      if (errorMessage.includes('not a valid PGP message')) {
        toast.error('Enter a valid PGP encrypted text.');
      } else if (errorMessage.includes('Misformed armored text')) {
        toast.error('Enter a valid input in PGP format');
      } else {
        toast.error('Decryption failed: ' + errorMessage);
      }
    }
  };

  const handleDecryptFiles = async () => {
    setDecryptedFiles([]);
    for (const file of uploadedFiles) {
      if (file && /\.(txt|eml|pgp|gpg)$/i.test(file.name)) {
        const reader = new FileReader();
        reader.onload = async () => {
          const content = reader.result as string;
          try {
            const decryptedContent = await handleDecrypt(content, 'file', file.name);
            if (decryptedContent) {
              setDecryptedFiles(prev => [
                ...prev,
                { filename: `${file.name.split('.').slice(0, -1).join('.')}_decrypted.txt`, content: decryptedContent }
              ]);
            }
          } catch (error) {
            console.error('Decryption Error: ', error);
            setError('Decryption failed for ' + file.name);
          }
        };
        reader.readAsText(file);
      }
    }
  };

  return (
    <div className="min-h-screen p-4">
      <section className='flex-1 container mx-auto py-20 text-center'>
        <h1 className='text-6xl sm:text-7xl lg:text-8xl font-extrabold gradient-title pb-6 flex flex-col'>
          CSIRT PGP Toolkit
        </h1>
        <p className='text-lg text-gray-400 max-w-3xl mx-auto'>
          Securely decrypt emails/messages with ease using our powerful PGP toolkit.
        </p>
      </section>
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* File Upload Card */}
        <Card className="md:col-span-1 border border-zinc-700 bg-zinc-900">
          <CardContent className="p-6">
            <h2 className="text-xl font-semibold mb-4 text-white">Upload files</h2>
            <div className="border-2 border-dashed border-blue-900 rounded-lg p-8 mb-4">
              <FileUploader
                value={uploadedFiles}
                onValueChange={handleFileUpload}
                dropzoneOptions={{ maxFiles: 3, maxSize: 50 * 1024 * 1024 }} // 50 MB
                className="flex flex-col items-center justify-center text-center"
              >
                <FileInput className='cursor-pointer'>
                  <div className="flex flex-col items-center justify-center h-32">
                    <div className="rounded-full bg-blue-50 p-3 mb-4">
                      <Upload className="h-6 w-6 text-blue-600" />
                    </div>
                    <div className="mb-1 text-sm text-white">
                      Drop your file here, or <span className="text-blue-500 hover:underline cursor-pointer">Browse</span>
                    </div>
                    <div className="text-xs text-gray-300">Maximum 3 files and 50 MB</div>
                  </div>
                </FileInput>
                <FileUploaderContent>
                  {uploadedFiles.map((file, index) => (
                    <div key={index} className="flex items-center justify-between mt-1 p-2 bg-blue-50 rounded">
                      <div className="flex items-center gap-2">
                        <div className="bg-blue-100 p-2 rounded">
                          <FileIcon className="h-4 w-4 text-blue-600" />
                        </div>
                        <div className="flex flex-col items-start justify-start">
                          <div className="text-sm font-medium">{file.name}</div>
                          <div className="text-xs text-gray-500">{file.type} • {(file.size / (1024 * 1024)).toFixed(2)} MB</div>
                        </div>
                      </div>
                      <div className="flex items-center justify-end">
                      <Progress value={100} className="h-1.5 w-20" /> 
                      <Button className='hover:text-red-500' variant="ghost" size="icon" onClick={() => setUploadedFiles(prev => prev.filter((_, i) => i !== index))}>
                        <X className="h-4 w-4" />
                      </Button>
                      </div>
                    </div>
                  ))}
                </FileUploaderContent>
              </FileUploader>
            </div>
            <div className="flex items-center justify-center ">
            <Button size="lg" className="w-full bg-blue-500 text-bold text-md text-white mt-1 mb-1 hover:bg-blue-600" onClick={handleDecryptFiles}>
                Decrypt <Key className='w-4 h-4' />
            </Button>
            </div>
          </CardContent>
        </Card>

        {/* Plans Card */}
        { decryptedFiles && (
        <Card className="md:col-span-1 bg-gray-900 text-white border-gray-700">
            
                <CardContent className="p-6">
                <h2 className="text-xl font-semibold mb-20">Decrypted files</h2>
                <div className="grid grid-cols-1 gap-8">
                    {decryptedFiles.map((file, index) => (
                        <div className="bg-blue-600 hover:bg-blue-700 p-4 rounded-lg relative">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2"> 
                                    <div className="bg-blue-400 h-14 w-14 rounded-lg flex items-center justify-center">
                                        <FileIcon className="h-10 w-10 text-grary-350" />
                                    </div>
                                    <div className="flex flex-col items-start justify-start">
                                        <h3 className="text-lg">{file.filename}</h3>
                                        <p className="text-sm text-gray-300">text/plain</p>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <Button className='hover:bg-transparent' variant="ghost" onClick={() => triggerDownload(file.content, file.filename)}>
                                        <Download className="h-4 w-4" />
                                    </Button>
                                    <Button className='hover:bg-transprent' variant="ghost" onClick={() => navigator.clipboard.writeText(file.content)}>
                                        <Copy className="h-4 w-4" />
                                    </Button>
                                    <Button className='hover:bg-transprent hover:text-red-500' variant="ghost" onClick={() => {
                                        navigator.clipboard.writeText(file.content);
                                        setDecryptedFiles(prev => prev.filter((_, i) => i !== index));
                                    }}>
                                        <X className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
              </CardContent>
            
        </Card>
        )}



        
      </div>
      

      
    </div>
  )
}

const triggerDownload = (content: string, filename: string) => {
  const blob = new Blob([content], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
};

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
  
