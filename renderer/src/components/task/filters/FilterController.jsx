import Button from "../../ui/Button";

export default function FilterController({ onApply, onClear }) {
    return (
        <div className="flex gap-2 justify-between">
            <Button handleClick={onApply} size="sm" className="flex-auto!">
                Apply
            </Button>
            <Button
                handleClick={onClear}
                size="sm"
                className="bg-gray-500! hover:bg-gray-600! flex-auto!"
            >
                Clear
            </Button>
        </div>
    );
}
