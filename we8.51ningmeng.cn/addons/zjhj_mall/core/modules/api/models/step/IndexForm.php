<?php

namespace app\modules\api\models\step;
use app\modules\api\models\ApiModel;
use app\hejiang\ApiResponse;
use app\modules\api\models\wxbdc\WXBizDataCrypt;
use Curl\Curl;
use app\hejiang\ApiCode;
class IndexForm extends ApiModel
{
    public $wechat_app;

    public $code;
    public $encrypted_data;
    public $iv;
    public $store_id;

    public function rules()
    {
        return [
            [['store_id'], 'integer'],
            [['wechat_app','code', 'encrypted_data', 'iv'], 'required'],
        ];
    }


    private function runData()
    {
        if (!$this->validate()) {
            return $this->errorResponse;
        }

        $res = $this->getOpenid($this->code);

        if (!$res || empty($res['openid'])) {
            return new ApiResponse(1, '获取用户OpenId失败', $res);
        }

        $session_key = $res['session_key'];
        $pc = new WXBizDataCrypt($this->wechat_app->app_id, $session_key);
        $errCode = $pc->decryptData($this->encrypted_data, $this->iv, $data);
        return json_decode($data, true); 
    }

    public function index()
    {

        return [
            'code' => ApiCode::CODE_SUCCESS,
            'data' => [
                'run_data' => $this->runData(),
            ],
        ];
    }

    private function getOpenid($code)
    {
        $api = "https://api.weixin.qq.com/sns/jscode2session?appid={$this->wechat_app->app_id}&secret={$this->wechat_app->app_secret}&js_code={$code}&grant_type=authorization_code";
        $curl = new Curl();
        $curl->setOpt(CURLOPT_SSL_VERIFYPEER, false);
        $curl->get($api);
        $res = $curl->response;
        $res = json_decode($res, true);
        return $res;
    }
}
