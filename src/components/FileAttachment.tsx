'use client';

import { formatFileSize, getFileIcon, isImageFile } from '@/lib/utils';
import { useState } from 'react';

export interface FileAttachment {
    id: string;
    fileName: string;
    fileType: string;
    fileSize: number;
    base64Data: string;
    extractedText?: string;
}

interface FileAttachmentProps {
    attachment: FileAttachment;
    onRemove?: () => void;
    showRemove?: boolean;
}

export function FileAttachmentComponent({ attachment, onRemove, showRemove = false }: FileAttachmentProps) {
    const [imageError, setImageError] = useState(false);
    const isImage = isImageFile(attachment.fileType);

    return (
        <div className="relative group">
            {isImage && !imageError ? (
                <div className="relative rounded-lg overflow-hidden border border-white/10 bg-secondary/20 max-w-xs">
                    <img
                        src={attachment.base64Data}
                        alt={attachment.fileName}
                        className="max-w-full h-auto max-h-64 object-contain"
                        onError={() => setImageError(true)}
                    />
                    {showRemove && onRemove && (
                        <button
                            onClick={onRemove}
                            className="absolute top-2 right-2 bg-red-500/80 hover:bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                            type="button"
                        >
                            ×
                        </button>
                    )}
                    <div className="px-2 py-1 bg-black/50 backdrop-blur-sm text-xs text-white">
                        {attachment.fileName} • {formatFileSize(attachment.fileSize)}
                    </div>
                </div>
            ) : (
                <div className="flex items-center gap-3 p-3 rounded-lg border border-white/10 bg-secondary/20 max-w-xs">
                    <span className="text-2xl">{getFileIcon(attachment.fileType)}</span>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{attachment.fileName}</p>
                        <p className="text-xs text-muted-foreground">{formatFileSize(attachment.fileSize)}</p>
                    </div>
                    {showRemove && onRemove && (
                        <button
                            onClick={onRemove}
                            className="text-red-400 hover:text-red-300 transition-colors"
                            type="button"
                        >
                            ×
                        </button>
                    )}
                </div>
            )}
        </div>
    );
}
