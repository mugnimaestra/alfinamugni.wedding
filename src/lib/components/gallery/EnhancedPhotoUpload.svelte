<script lang="ts">
	import { onMount } from 'svelte';
	import { processImageForUpload, type ProcessedImage } from '$lib/utils/image-processor';
	import { getNetworkInfo, type NetworkInfo } from '$lib/utils/network-utils';
	import { Upload, X, Camera, FolderOpen, Grid3x3, List, Search } from 'lucide-svelte';

	interface UploadFile {
		id: string;
		file: File;
		preview: string;
		processed?: ProcessedImage;
		status: 'pending' | 'processing' | 'uploading' | 'completed' | 'error';
		progress: number;
		error?: string;
		metadata?: {
			width: number;
			height: number;
			size: number;
			compressedSize?: number;
			format: string;
			deviceInfo: string;
			networkInfo: string;
		};
	}

	interface UploadSettings {
		autoCompress: boolean;
		autoEnhance: boolean;
	}

	// Props
	interface Props {
		maxFiles?: number;
		maxFileSize?: number;
		acceptedFormats?: string[];
		onUploadComplete?: (files: UploadFile[]) => void;
		onError?: (error: string) => void;
	}

	let {
		maxFiles = 50,
		maxFileSize = 20,
		acceptedFormats = ['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif'],
		onUploadComplete,
		onError,
	}: Props = $props();

	// State
	let selectedFiles = $state<UploadFile[]>([]);
	let networkInfo = $state<NetworkInfo | null>(null);
	let uploadSettings = $state<UploadSettings>({
		autoCompress: true,
		autoEnhance: true,
	});
	let isUploading = $state(false);
	let totalProgress = $state(0);
	let isDragging = $state(false);
	let activeTab = $state('upload');
	let viewMode = $state<'grid' | 'list'>('grid');
	let searchQuery = $state('');
	let supportsCamera = $state(false);

	let fileInputRef: HTMLInputElement;
	let cameraInputRef: HTMLInputElement;

	onMount(async () => {
		// Check device capabilities
		supportsCamera = !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);

		// Get network information
		const info = await getNetworkInfo();
		networkInfo = info;

		// Adjust settings based on network
		if (info.effectiveType === '2g' || info.saveData) {
			uploadSettings.autoCompress = true;
			uploadSettings.autoEnhance = false;
		}
	});

	function generateId() {
		return `upload-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
	}

	async function createPreview(file: File): Promise<string> {
		return new Promise((resolve, reject) => {
			const reader = new FileReader();
			reader.onload = (e) => resolve(e.target?.result as string);
			reader.onerror = reject;
			reader.readAsDataURL(file);
		});
	}

	async function extractMetadata(file: File): Promise<UploadFile['metadata']> {
		const metadata: UploadFile['metadata'] = {
			width: 0,
			height: 0,
			size: file.size,
			format: file.type,
			deviceInfo: getDeviceInfo(),
			networkInfo: networkInfo
				? `${networkInfo.effectiveType} (${networkInfo.downlink}Mbps)`
				: 'Unknown',
		};

		if (file.type.startsWith('image/')) {
			try {
				const img = new Image();
				await new Promise((resolve, reject) => {
					img.onload = resolve;
					img.onerror = reject;
					img.src = URL.createObjectURL(file);
				});
				metadata.width = img.width;
				metadata.height = img.height;
				URL.revokeObjectURL(img.src);
			} catch (error) {
				console.warn('Failed to extract image dimensions:', error);
			}
		}

		return metadata;
	}

	function getDeviceInfo(): string {
		const ua = navigator.userAgent;
		const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua);

		if (isMobile) {
			if (/Android/i.test(ua)) return 'Android';
			if (/iPhone|iPad|iPod/i.test(ua)) return 'iOS';
			return 'Mobile';
		}

		return 'Desktop';
	}

	async function processFiles(files: FileList | File[]) {
		const fileArray = Array.from(files);

		if (selectedFiles.length + fileArray.length > maxFiles) {
			onError?.(`Maximum ${maxFiles} files allowed`);
			return;
		}

		for (const file of fileArray) {
			// Validate file
			if (!acceptedFormats.includes(file.type)) {
				onError?.(`Unsupported file type: ${file.type}`);
				continue;
			}

			if (file.size > maxFileSize * 1024 * 1024) {
				onError?.(`File too large: ${file.name} (max ${maxFileSize}MB)`);
				continue;
			}

			try {
				const preview = await createPreview(file);
				const metadata = await extractMetadata(file);

				const uploadFile: UploadFile = {
					id: generateId(),
					file,
					preview,
					status: 'pending',
					progress: 0,
					metadata,
				};

				selectedFiles = [...selectedFiles, uploadFile];

				// Auto-process if enabled
				if (uploadSettings.autoCompress && file.type.startsWith('image/')) {
					await processUploadFile(uploadFile);
				}
			} catch (error) {
				console.error('Error processing file:', error);
				onError?.(`Failed to process ${file.name}`);
			}
		}
	}

	async function processUploadFile(uploadFile: UploadFile) {
		if (!uploadFile.file.type.startsWith('image/')) return;

		uploadFile.status = 'processing';
		selectedFiles = [...selectedFiles];

		try {
			const processed = await processImageForUpload(uploadFile.file, {
				maxFileSizeMB: maxFileSize,
				targetQuality: uploadSettings.autoEnhance ? 0.85 : 0.75,
				generateThumbnail: true,
				optimizeForMobile: true,
				preserveOriginal: false,
			});

			uploadFile.processed = processed;
			if (uploadFile.metadata) {
				uploadFile.metadata.compressedSize = processed.compressedBlob.size;
			}
			uploadFile.status = 'pending';
			selectedFiles = [...selectedFiles];

			console.log(`[EnhancedPhotoUpload] Processed ${uploadFile.file.name}:`, {
				original: (uploadFile.file.size / 1024 / 1024).toFixed(2) + 'MB',
				compressed: (processed.compressedBlob.size / 1024 / 1024).toFixed(2) + 'MB',
				compression:
					((1 - processed.compressedBlob.size / uploadFile.file.size) * 100).toFixed(1) + '%',
			});
		} catch (error) {
			console.error('Processing failed:', error);
			uploadFile.status = 'error';
			uploadFile.error = 'Processing failed';
			selectedFiles = [...selectedFiles];
		}
	}

	function handleFileSelect(event: Event) {
		const input = event.target as HTMLInputElement;
		if (input.files) {
			processFiles(input.files);
		}
	}

	function handleDrop(event: DragEvent) {
		event.preventDefault();
		isDragging = false;

		if (event.dataTransfer?.files) {
			processFiles(event.dataTransfer.files);
		}
	}

	function handleDragOver(event: DragEvent) {
		event.preventDefault();
		isDragging = true;
	}

	function handleDragLeave() {
		isDragging = false;
	}

	function captureFromCamera() {
		if (!supportsCamera) {
			onError?.('Camera not available');
			return;
		}

		cameraInputRef?.click();
	}

	function removeFile(fileId: string) {
		selectedFiles = selectedFiles.filter((f) => f.id !== fileId);
	}

	async function uploadAllFiles() {
		const readyFiles = selectedFiles.filter((f) => f.status === 'pending');

		if (readyFiles.length === 0) {
			onError?.('No files ready to upload');
			return;
		}

		isUploading = true;
		totalProgress = 0;

		try {
			for (let i = 0; i < readyFiles.length; i++) {
				const file = readyFiles[i];
				file.status = 'uploading';
				selectedFiles = [...selectedFiles];

				try {
					const fileToUpload = file.processed?.compressedBlob || file.file;

					const uploadFileObj = new File([fileToUpload], file.file.name, {
						type: fileToUpload.type,
						lastModified: Date.now(),
					});

					// Upload to API
					const formData = new FormData();
					formData.append('file', uploadFileObj);
					formData.append('uploader_name', file.metadata?.deviceInfo || 'Guest');
					formData.append('description', `Uploaded from ${file.metadata?.deviceInfo}`);

					const response = await fetch('/api/gallery/upload', {
						method: 'POST',
						body: formData,
					});

					if (!response.ok) {
						throw new Error('Upload failed');
					}

					file.status = 'completed';
					file.progress = 100;
				} catch (error) {
					file.status = 'error';
					file.error = 'Upload failed';
					console.error('Upload failed:', error);
				}

				totalProgress = ((i + 1) / readyFiles.length) * 100;
				selectedFiles = [...selectedFiles];
			}

			onUploadComplete?.(readyFiles.filter((f) => f.status === 'completed'));

			// Clear completed files after delay
			setTimeout(() => {
				selectedFiles = selectedFiles.filter((f) => f.status !== 'completed');
				isUploading = false;
				totalProgress = 0;
			}, 3000);
		} catch (error) {
			console.error('Batch upload error:', error);
			onError?.('Upload failed');
			isUploading = false;
		}
	}

	function formatFileSize(bytes: number): string {
		if (bytes < 1024) return bytes + ' B';
		if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
		return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
	}

	function getStatusIcon(status: UploadFile['status']) {
		switch (status) {
			case 'pending':
				return '⏳';
			case 'processing':
				return '🔄';
			case 'uploading':
				return '📤';
			case 'completed':
				return '✅';
			case 'error':
				return '❌';
			default:
				return '📷';
		}
	}
</script>

<div class="w-full max-w-6xl mx-auto space-y-6">
	<!-- Network Status -->
	{#if networkInfo}
		<div class="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg">
			<div class="flex items-center justify-between">
				<div class="flex items-center gap-4">
					<div class="flex items-center gap-2">
						<span class="text-2xl">📶</span>
						<div>
							<div class="font-medium text-blue-900">
								{networkInfo.carrier?.name || 'Unknown Network'}
							</div>
							<div class="text-sm text-blue-700">
								{networkInfo.effectiveType?.toUpperCase()} • {networkInfo.downlink} Mbps
							</div>
						</div>
					</div>
					<span class="px-2 py-1 text-sm border border-blue-300 text-blue-700 rounded">
						{networkInfo.region?.name}
					</span>
				</div>
				<div class="text-sm text-blue-600">
					{networkInfo.timeOfDay === 'peak'
						? '🔴 Peak Hours'
						: networkInfo.timeOfDay === 'off-peak'
						? '🟢 Off-Peak'
						: '🟡 Normal'}
				</div>
			</div>
		</div>
	{/if}

	<!-- Tabs -->
	<div class="border border-gray-200 rounded-lg">
		<div class="grid grid-cols-3 border-b border-gray-200">
			<button
				class="px-4 py-3 text-sm font-medium transition-colors {activeTab === 'upload'
					? 'border-b-2 border-blue-500 text-blue-600 bg-blue-50'
					: 'text-gray-600 hover:bg-gray-50'}"
				onclick={() => (activeTab = 'upload')}
			>
				📤 Upload
			</button>
			<button
				class="px-4 py-3 text-sm font-medium transition-colors {activeTab === 'organize'
					? 'border-b-2 border-blue-500 text-blue-600 bg-blue-50'
					: 'text-gray-600 hover:bg-gray-50'}"
				onclick={() => (activeTab = 'organize')}
			>
				📁 Organize
			</button>
			<button
				class="px-4 py-3 text-sm font-medium transition-colors {activeTab === 'settings'
					? 'border-b-2 border-blue-500 text-blue-600 bg-blue-50'
					: 'text-gray-600 hover:bg-gray-50'}"
				onclick={() => (activeTab = 'settings')}
			>
				⚙️ Settings
			</button>
		</div>

		<!-- Upload Tab -->
		{#if activeTab === 'upload'}
			<div class="p-6 space-y-6">
				<!-- Drag & Drop Area -->
				<div
					class="relative border-2 border-dashed rounded-xl p-12 text-center transition-all {isDragging
						? 'border-blue-500 bg-blue-50 scale-105'
						: 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'}"
					ondrop={handleDrop}
					ondragover={handleDragOver}
					ondragleave={handleDragLeave}
					role="button"
					tabindex="0"
				>
					<input
						bind:this={fileInputRef}
						type="file"
						multiple
						accept={acceptedFormats.join(',')}
						onchange={handleFileSelect}
						class="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
					/>
					<input
						bind:this={cameraInputRef}
						type="file"
						accept="image/*"
						capture="environment"
						onchange={handleFileSelect}
						class="hidden"
					/>

					<div class="space-y-6">
						<div class="text-6xl animate-bounce">📸</div>

						<div>
							<h3 class="text-2xl font-bold text-gray-800 mb-2">Enhanced Photo Upload</h3>
							<p class="text-gray-600 max-w-md mx-auto">
								Drag & drop your wedding photos here, or click to browse. Advanced compression and
								optimization included!
							</p>
						</div>

						<div class="flex flex-col sm:flex-row gap-4 justify-center">
							<button
								onclick={() => fileInputRef?.click()}
								class="inline-flex items-center justify-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
							>
								<FolderOpen class="w-5 h-5 mr-2" />
								Browse Files
							</button>

							{#if supportsCamera}
								<button
									onclick={captureFromCamera}
									class="inline-flex items-center justify-center px-6 py-3 border-2 border-green-600 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
								>
									<Camera class="w-5 h-5 mr-2" />
									Take Photo
								</button>
							{/if}
						</div>

						<div class="text-sm text-gray-500 space-y-1">
							<div>Maximum {maxFiles} files • {maxFileSize}MB per file</div>
							<div>Supported: JPEG, PNG, WebP, HEIC</div>
							<div class="flex items-center justify-center gap-4">
								<span>✨ Auto-compression</span>
								<span>🎨 Auto-enhancement</span>
								<span>📱 Mobile optimized</span>
							</div>
						</div>
					</div>
				</div>

				<!-- Upload Progress -->
				{#if isUploading}
					<div class="p-6 border border-gray-200 rounded-lg bg-white">
						<div class="space-y-4">
							<div class="flex items-center justify-between">
								<h4 class="font-semibold">Uploading Files...</h4>
								<span class="text-sm text-gray-600">
									{Math.round(totalProgress)}%
								</span>
							</div>
							<div class="w-full bg-gray-200 rounded-full h-3">
								<div
									class="bg-blue-600 h-3 rounded-full transition-all duration-300"
									style="width: {totalProgress}%"
								/>
							</div>
							<div class="text-sm text-gray-600">
								{selectedFiles.filter((f) => f.status === 'completed').length} /
								{selectedFiles.filter((f) => f.status !== 'error').length} completed
							</div>
						</div>
					</div>
				{/if}

				<!-- File List -->
				{#if selectedFiles.length > 0}
					<div class="p-6 border border-gray-200 rounded-lg bg-white">
						<div class="flex items-center justify-between mb-6">
							<h3 class="text-lg font-semibold">Selected Files ({selectedFiles.length})</h3>
							<div class="flex gap-2">
								<button
									onclick={uploadAllFiles}
									disabled={isUploading ||
										selectedFiles.filter((f) => f.status === 'pending').length === 0}
									class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
								>
									<Upload class="w-4 h-4 inline mr-2" />
									Upload All
								</button>
								<button
									onclick={() => (viewMode = viewMode === 'grid' ? 'list' : 'grid')}
									class="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
								>
									{#if viewMode === 'grid'}
										<List class="w-4 h-4" />
									{:else}
										<Grid3x3 class="w-4 h-4" />
									{/if}
								</button>
							</div>
						</div>

						<!-- Search -->
						<div class="relative mb-4">
							<Search class="w-4 h-4 absolute left-3 top-3 text-gray-400" />
							<input
								type="text"
								placeholder="Search files..."
								bind:value={searchQuery}
								class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
							/>
						</div>

						<!-- Files Grid/List -->
						<div
							class={viewMode === 'grid'
								? 'grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4'
								: 'space-y-2'}
						>
							{#each selectedFiles.filter((file) => file.file.name
									.toLowerCase()
									.includes(searchQuery.toLowerCase())) as file (file.id)}
								<div
									class="relative border border-gray-200 rounded-lg overflow-hidden group {viewMode ===
									'list'
										? 'flex items-center p-2'
										: 'p-2'}"
								>
									{#if viewMode === 'grid'}
										<img
											src={file.preview}
											alt={file.file.name}
											class="w-full h-48 object-cover rounded-lg"
										/>
									{:else}
										<img
											src={file.preview}
											alt={file.file.name}
											class="w-16 h-16 object-cover rounded-lg mr-3"
										/>
									{/if}

									<button
										onclick={() => removeFile(file.id)}
										class="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
									>
										<X class="w-4 h-4" />
									</button>

									<div class="flex-1 {viewMode === 'list' ? '' : 'mt-2'}">
										<div class="flex items-center gap-2 mb-1">
											<span class="text-lg">{getStatusIcon(file.status)}</span>
											<div class="flex-1 min-w-0">
												<p class="text-sm font-medium text-gray-900 truncate">{file.file.name}</p>
												<p class="text-xs text-gray-500">{formatFileSize(file.file.size)}</p>
												{#if file.metadata?.compressedSize}
													<p class="text-xs text-green-600">
														→ {formatFileSize(file.metadata.compressedSize)} (
														{(
															((file.file.size - file.metadata.compressedSize) / file.file.size) *
															100
														).toFixed(0)}% saved)
													</p>
												{/if}
											</div>
										</div>
									</div>
								</div>
							{/each}
						</div>
					</div>
				{/if}
			</div>
		{/if}

		<!-- Organize Tab -->
		{#if activeTab === 'organize'}
			<div class="p-6 space-y-4">
				<p class="text-sm text-gray-600">Photo organization features coming soon.</p>
			</div>
		{/if}

		<!-- Settings Tab -->
		{#if activeTab === 'settings'}
			<div class="p-6 space-y-4">
				<div class="flex items-center justify-between">
					<div>
						<div class="font-medium text-gray-900">Auto-compress images</div>
						<div class="text-sm text-gray-500">
							Automatically compress images based on network conditions
						</div>
					</div>
					<label class="relative inline-flex items-center cursor-pointer">
						<input
							type="checkbox"
							bind:checked={uploadSettings.autoCompress}
							class="sr-only peer"
						/>
						<div
							class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"
						/>
					</label>
				</div>

				<div class="flex items-center justify-between">
					<div>
						<div class="font-medium text-gray-900">Auto-enhance images</div>
						<div class="text-sm text-gray-500">Apply automatic color and quality enhancements</div>
					</div>
					<label class="relative inline-flex items-center cursor-pointer">
						<input type="checkbox" bind:checked={uploadSettings.autoEnhance} class="sr-only peer" />
						<div
							class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"
						/>
					</label>
				</div>

				{#if networkInfo}
					<div class="pt-4 border-t border-gray-200">
						<h4 class="font-medium text-gray-900 mb-2">Network Information</h4>
						<div class="space-y-2 text-sm text-gray-600">
							<div>
								<span class="font-medium">Carrier:</span>
								{networkInfo.carrier?.name || 'Unknown'}
							</div>
							<div>
								<span class="font-medium">Speed:</span>
								{networkInfo.effectiveType?.toUpperCase()} ({networkInfo.downlink} Mbps)
							</div>
							<div>
								<span class="font-medium">Time:</span>
								{networkInfo.timeOfDay}
							</div>
							{#if networkInfo.batteryLevel}
								<div>
									<span class="font-medium">Battery:</span>
									{networkInfo.batteryLevel.toFixed(0)}%
								</div>
							{/if}
						</div>
					</div>
				{/if}
			</div>
		{/if}
	</div>
</div>
