<?php
namespace app\modules\api\controllers\step;

use app\hejiang\ApiResponse;
use app\hejiang\BaseApiResponse;
use app\modules\api\models\step\IndexForm;

class DefaultController extends Controller
{
    public function actionIndex()
    { 
        $form = new IndexForm();
        $form->attributes = \Yii::$app->request->post();
        $form->wechat_app = $this->wechat_app;
        $form->store_id = $this->store->id;
        return new BaseApiResponse($form->index());
    }
}
