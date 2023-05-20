export function getTimeDifference(
	fromDate: Date | string,
	toDate: Date | string,
	type: "Y" | "M" | "D" | "H" | "m" | "s" = "D"
): number {
	const from = typeof fromDate === "string" ? new Date(fromDate) : fromDate;
	const to = typeof toDate === "string" ? new Date(toDate) : toDate;

	const startDate = new Date(from);
	const endDate = new Date(to);
	const timeDifference = endDate.getTime() - startDate.getTime();

	const calculate = () => {
		switch (type) {
			case "Y": {
				return Math.floor(timeDifference / (1000 * 60 * 60 * 24 * 365));
				break;
			}

			case "M": {
				return Math.floor(timeDifference / (1000 * 60 * 60 * 24 * 30));
				break;
			}

			case "D": {
				return Math.floor(timeDifference / (1000 * 60 * 60 * 24));
				break;
			}

			case "H": {
				return Math.floor(timeDifference / (1000 * 60 * 60));
				break;
			}

			case "m": {
				return Math.floor(timeDifference / (1000 * 60));
				break;
			}

			case "s": {
				return Math.floor(timeDifference / 1000);
				break;
			}

			default: {
				return Math.floor(timeDifference / (1000 * 60 * 60 * 24));
				break;
			}
		}
	};

	const daysDifference = calculate();

	return daysDifference;
}
