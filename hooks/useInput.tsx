import { validImageTypes, validVideoTypes } from "@/utils/types/file";
import React, { useCallback } from "react";

export type ImageOrVideoType = {
	name: string;
	url: string;
	size: number;
	type: string;
	height: number;
	width: number;
};

const useInput = () => {
	const getImageFile = useCallback(
		async ({ image }: { image: ImageOrVideoType | null }) => {
			if (image) {
				const response = await fetch(image.url);
				const blob = await response.blob();

				return new File([blob], image.name, {
					type: image.type,
				});
			} else {
				return null;
			}
		},
		[]
	);

	const validateImageOrVideo = useCallback((imageOrVideo: File) => {
		if (validImageTypes.ext.includes(imageOrVideo.type)) {
			if (imageOrVideo.size > 1024 * 1024 * 2) {
				return false;
			}

			return true;
		} else if (validVideoTypes.ext.includes(imageOrVideo.type)) {
			if (imageOrVideo.size > 1024 * 1024 * 20) {
				return false;
			}

			return true;
		} else {
			return false;
		}
	}, []);

	const uploadImageOrVideo = useCallback(
		async (file: File): Promise<ImageOrVideoType | null> => {
			if (!file || !validateImageOrVideo(file)) {
				return null;
			}

			if (validImageTypes.ext.includes(file.type)) {
				return new Promise((resolve) => {
					const reader = new FileReader();

					reader.onload = async (event) => {
						const result = event.target?.result as string;
						const img = new Image();

						img.onload = async () => {
							const canvas = document.createElement("canvas");
							const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;

							const height = img.height;
							const width = img.width;

							canvas.height = height;
							canvas.width = width;

							ctx.fillStyle = "#fff";
							ctx.fillRect(0, 0, width, height);

							ctx.drawImage(img, 0, 0, width, height);

							canvas.toBlob(
								async (blob) => {
									if (blob) {
										const imageOrVideo: ImageOrVideoType = {
											name: file.name,
											url: URL.createObjectURL(blob),
											size: blob.size,
											type: blob.type,
											height,
											width,
										};
										resolve(imageOrVideo);
									}
								},
								"image/webp",
								0.8
							);

							img.remove();
							canvas.remove();
							reader.abort();
						};

						img.src = result;
					};

					reader.readAsDataURL(file);
				});
			} else if (validVideoTypes.ext.includes(file.type)) {
				return new Promise((resolve) => {
					const reader = new FileReader();

					reader.onload = () => {
						const result = reader.result as ArrayBuffer;
						const blob = new Blob([result], { type: file.type || "video/mp4" });
						const video = document.createElement("video");

						video.onloadedmetadata = () => {
							const imageOrVideo: ImageOrVideoType = {
								name: file.name,
								url: URL.createObjectURL(blob),
								size: blob.size,
								type: blob.type,
								height: video.videoHeight,
								width: video.videoWidth,
							};
							resolve(imageOrVideo);

							video.remove();
							reader.abort();
						};

						video.src = URL.createObjectURL(blob);
					};

					reader.readAsArrayBuffer(file);
				});
			}

			return null;
		},
		[validateImageOrVideo]
	);

	const calculateDaysAway = (
		fromDate: Date | string,
		toDate: Date | string
	): number => {
		const timeDiff = Math.abs(
			(typeof fromDate === "string"
				? new Date(fromDate).getTime()
				: fromDate.getTime()) -
				(typeof toDate === "string"
					? new Date(toDate).getTime()
					: toDate.getTime())
		);

		const daysAway = Math.ceil(timeDiff / (1000 * 3600 * 24));

		return daysAway;
	};

	const formatNumberWithSuffix = useCallback((number: number) => {
		const suffixes = ["", "K", "M", "B"];
		let suffixIndex = 0;
		while (number >= 1000 && suffixIndex < suffixes.length - 1) {
			number /= 1000;
			suffixIndex++;
		}
		const roundedNumber = Math.floor(number * 100) / 100;
		const suffix = suffixes[suffixIndex];
		return `${roundedNumber}${suffix}`;
	}, []);

	const formatFileSize = useCallback((size: number) => {
		const units = ["B", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];
		let i = 0;
		let fileSize = size;
		while (fileSize >= 1024) {
			fileSize /= 1024;
			i++;
		}
		return fileSize.toFixed(2) + " " + units[i];
	}, []);

	return {
		getImageFile,
		uploadImageOrVideo,
		calculateDaysAway,
		formatNumberWithSuffix,
		formatFileSize,
	};
};

export default useInput;
