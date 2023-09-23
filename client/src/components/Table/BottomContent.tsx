import React, {useMemo} from "react";
import {Button, Pagination} from "@nextui-org/react";

type BottomContentProps = {
    page: number;
    pages: number;
    setPage: (page: number) => void;
    onPreviousPage: () => void;
    onNextPage: () => void;
}
export const BottomContent: React.FC<BottomContentProps> = ({ page, pages, setPage, onPreviousPage, onNextPage}) => {
    return useMemo(() => {
        return (
            <div className="flex justify-center gap-4">
                <div className="flex justify-center gap-4">
                    <Pagination
                        isCompact
                        showControls
                        showShadow
                        color="primary"
                        page={page}
                        total={pages}
                        onChange={setPage}
                        className={'w-[70%]'}
                    />
                    <div className="hidden sm:flex w-[30%] justify-end gap-2">
                        <Button isDisabled={pages === 1} size="sm" variant="flat" onPress={onPreviousPage}>
                            Previous
                        </Button>
                        <Button isDisabled={pages === 1} size="sm" variant="flat" onPress={onNextPage}>
                            Next
                        </Button>
                    </div>
                </div>
            </div>
        )
    }, [page, pages, onNextPage, onPreviousPage]);
}