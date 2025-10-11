'use client'

import { useState, useCallback } from 'react'
import Cropper from 'react-easy-crop'
import { X, RotateCw, ZoomIn, ZoomOut, Crop } from 'lucide-react'

interface CropArea {
  x: number
  y: number
  width: number
  height: number
}

interface ImageCropModalProps {
  image: string
  onComplete: (croppedImage: File) => void
  onCancel: () => void
  aspectRatio?: number // 16/9, 4/3, 1 (square), etc. undefined = free aspect
  fileName?: string
}

export default function ImageCropModal({
  image,
  onComplete,
  onCancel,
  aspectRatio,
  fileName = 'cropped-image.jpg'
}: ImageCropModalProps) {
  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [rotation, setRotation] = useState(0)
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<CropArea | null>(null)
  const [processing, setProcessing] = useState(false)

  const onCropComplete = useCallback((_croppedArea: CropArea, croppedAreaPixels: CropArea) => {
    setCroppedAreaPixels(croppedAreaPixels)
  }, [])

  const createImage = (url: string): Promise<HTMLImageElement> =>
    new Promise((resolve, reject) => {
      const image = new Image()
      image.addEventListener('load', () => resolve(image))
      image.addEventListener('error', (error) => reject(error))
      image.setAttribute('crossOrigin', 'anonymous')
      image.src = url
    })

  const getCroppedImg = async (
    imageSrc: string,
    pixelCrop: CropArea,
    rotation = 0
  ): Promise<Blob> => {
    const image = await createImage(imageSrc)
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')

    if (!ctx) {
      throw new Error('No 2d context')
    }

    const maxSize = Math.max(image.width, image.height)
    const safeArea = 2 * ((maxSize / 2) * Math.sqrt(2))

    canvas.width = safeArea
    canvas.height = safeArea

    ctx.translate(safeArea / 2, safeArea / 2)
    ctx.rotate((rotation * Math.PI) / 180)
    ctx.translate(-safeArea / 2, -safeArea / 2)

    ctx.drawImage(
      image,
      safeArea / 2 - image.width * 0.5,
      safeArea / 2 - image.height * 0.5
    )

    const data = ctx.getImageData(0, 0, safeArea, safeArea)

    canvas.width = pixelCrop.width
    canvas.height = pixelCrop.height

    ctx.putImageData(
      data,
      Math.round(0 - safeArea / 2 + image.width * 0.5 - pixelCrop.x),
      Math.round(0 - safeArea / 2 + image.height * 0.5 - pixelCrop.y)
    )

    return new Promise((resolve, reject) => {
      canvas.toBlob((blob) => {
        if (blob) {
          resolve(blob)
        } else {
          reject(new Error('Canvas is empty'))
        }
      }, 'image/jpeg', 0.95)
    })
  }

  const handleCrop = async () => {
    if (!croppedAreaPixels) return

    try {
      setProcessing(true)
      const croppedBlob = await getCroppedImg(image, croppedAreaPixels, rotation)
      const croppedFile = new File([croppedBlob], fileName, {
        type: 'image/jpeg',
        lastModified: Date.now()
      })
      onComplete(croppedFile)
    } catch (error) {
      console.error('Error cropping image:', error)
      alert('Failed to crop image. Please try again.')
    } finally {
      setProcessing(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <Crop className="w-5 h-5 text-[#0a4373]" />
            <h2 className="text-xl font-semibold text-slate-900">Crop & Adjust Image</h2>
          </div>
          <button
            onClick={onCancel}
            className="text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Crop Area */}
        <div className="relative flex-1 bg-slate-900" style={{ minHeight: '400px' }}>
          <Cropper
            image={image}
            crop={crop}
            zoom={zoom}
            rotation={rotation}
            aspect={aspectRatio}
            onCropChange={setCrop}
            onCropComplete={onCropComplete}
            onZoomChange={setZoom}
            onRotationChange={setRotation}
          />
        </div>

        {/* Controls */}
        <div className="p-6 border-t border-slate-200 space-y-4">
          {/* Zoom Control */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                <ZoomIn className="w-4 h-4" />
                Zoom
              </label>
              <span className="text-sm text-slate-500">{Math.round(zoom * 100)}%</span>
            </div>
            <input
              type="range"
              min={1}
              max={3}
              step={0.1}
              value={zoom}
              onChange={(e) => setZoom(Number(e.target.value))}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer slider"
            />
          </div>

          {/* Rotation Control */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                <RotateCw className="w-4 h-4" />
                Rotation
              </label>
              <span className="text-sm text-slate-500">{rotation}°</span>
            </div>
            <input
              type="range"
              min={0}
              max={360}
              step={1}
              value={rotation}
              onChange={(e) => setRotation(Number(e.target.value))}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer slider"
            />
          </div>

          {/* Aspect Ratio Presets */}
          <div>
            <label className="text-sm font-medium text-slate-700 mb-2 block">
              Aspect Ratio
            </label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setZoom(1)}
                className="text-xs px-3 py-1.5 bg-slate-100 hover:bg-slate-200 rounded text-slate-700 transition-colors"
              >
                Reset Zoom
              </button>
              <button
                type="button"
                onClick={() => setRotation(0)}
                className="text-xs px-3 py-1.5 bg-slate-100 hover:bg-slate-200 rounded text-slate-700 transition-colors"
              >
                Reset Rotation
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
            <button
              onClick={onCancel}
              className="px-4 py-2 text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              onClick={handleCrop}
              disabled={processing}
              className="px-6 py-2 bg-[#0a4373] text-white rounded-lg hover:bg-[#083455] transition-colors font-medium disabled:opacity-50 flex items-center gap-2"
            >
              {processing ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <Crop className="w-4 h-4" />
                  <span>Apply Crop</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      <style jsx>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: #0a4373;
          cursor: pointer;
        }

        .slider::-moz-range-thumb {
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: #0a4373;
          cursor: pointer;
          border: none;
        }
      `}</style>
    </div>
  )
}

