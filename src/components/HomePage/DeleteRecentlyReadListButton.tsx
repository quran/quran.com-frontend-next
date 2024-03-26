import useTranslation from 'next-translate/useTranslation';
import { mutate } from 'swr';

import styles from "./DeleteRecentlyReadListButton.module.scss";
import DeleteIcon from "@/icons/delete.svg";

import { isLoggedIn } from '@/utils/auth/login';
import { deleteRecentlyReadList } from '@/utils/auth/api';
import { makeReadingSessionsUrl } from '@/utils/auth/apiPaths';

import { resetReadingTracker } from '@/redux/slices/QuranReader/readingTracker';
import { useDispatch } from 'react-redux';

import Button from '@/dls/Button/Button';
import { ButtonType, ButtonVariant } from '@/dls/Button/Button';


const DeleteReadingListButton = () => {

    const { t, lang } = useTranslation('home');
    const dispatch = useDispatch()

    const handleReadingListDeletion = async () => {
        if (isLoggedIn()) {
            await deleteRecentlyReadList()
            mutate(makeReadingSessionsUrl())
        }
        dispatch(resetReadingTracker())
    }

    return (
        <Button
            type={ButtonType.Error}
            variant={ButtonVariant.Ghost}
            className={styles.deleteButton}
            onClick={() => handleReadingListDeletion()}
        >
            <span className={styles.icon}>
                <DeleteIcon />
            </span>
            {t("delete-reading-list")}
        </Button>
    )
}

export default DeleteReadingListButton