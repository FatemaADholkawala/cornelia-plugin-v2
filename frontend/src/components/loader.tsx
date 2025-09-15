import Image from "next/image";
import spinner from "/public/images/spinner.svg";

const Loader = () => (
	<div className="flex justify-center items-center">
		<Image src={spinner} width={60} height={60} alt="Spinner" title="Spinner" />
	</div>
);

export default Loader;
